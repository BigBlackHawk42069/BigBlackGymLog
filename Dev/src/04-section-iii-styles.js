    /**
     *  [SECTION III] THE PHYSIQUE (Assets & Styles)
     *  ========================================================================
     *  The Big & Black Part of the script.
     */
    const ASSETS = {
        HEADER_IMG: cdnize("https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/cal-hdr.jpg"),
        GLASS_OVERLAY: cdnize("https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/glass-ovly.jpg"),
        STICKER_BG: cdnize("https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Stickerbook/stkr-bckgr.png"),
        NEW_STICKER_FRAME: cdnize("https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/new-stkr.png"),
        GRADIENT: `<defs><linearGradient id="bbgl_silver_grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#d9d9d9;stop-opacity:1" /><stop offset="100%" style="stop-color:#999999;stop-opacity:1" /></linearGradient></defs>`
    };
    const ICONS = {
        LOGO_PATH: `M193.636 22.044 C 182.529 27.985,180.338 45.621,189.593 54.592 C 193.384 58.266,193.325 58.939,188.176 70.810 C 163.707 127.227,143.908 132.713,103.872 94.170 C 97.232 87.778,97.187 87.704,98.234 84.744 C 102.964 71.365,85.668 57.225,74.917 65.683 C 65.274 73.267,71.102 91.707,83.674 93.393 C 86.535 93.777,87.611 94.407,88.243 96.069 C 89.543 99.488,100.349 139.625,104.966 158.182 C 107.267 167.432,109.322 175.494,109.532 176.099 C 109.800 176.869,111.627 176.423,115.639 174.608 C 154.845 156.875,247.090 156.878,286.205 174.613 C 293.432 177.890,291.721 180.896,299.107 151.950 C 311.947 101.626,314.454 93.636,317.401 93.636 C 326.599 93.636,334.579 79.275,330.342 70.347 C 322.578 53.985,297.084 68.675,303.582 85.767 C 305.874 91.794,271.086 117.463,258.740 118.855 C 242.368 120.700,226.759 103.733,212.306 68.380 L 208.113 58.124 211.323 55.097 C 226.571 40.716,211.474 12.503,193.636 22.044 M138.379 65.055 C 132.851 68.927,132.526 85.309,137.973 85.475 C 138.338 85.486,139.582 86.223,140.738 87.112 L 142.839 88.729 139.512 98.673 C 137.682 104.142,135.612 109.726,134.911 111.082 C 133.185 114.418,133.200 114.456,136.789 115.955 C 146.318 119.937,155.721 116.589,165.869 105.601 L 168.556 102.692 162.196 96.119 C 152.170 85.755,152.287 85.936,154.000 83.490 C 160.757 73.843,147.749 58.492,138.379 65.055 M254.135 66.447 C 249.029 70.930,247.780 79.527,251.606 83.864 C 253.281 85.763,253.294 85.744,242.310 97.108 L 235.000 104.671 239.263 108.569 C 247.293 115.913,255.483 117.954,264.959 114.973 C 271.221 113.003,271.405 112.722,269.230 108.440 C 267.406 104.849,262.723 90.706,262.733 88.817 C 262.736 88.218,263.983 87.019,265.504 86.154 C 267.186 85.196,268.997 82.935,270.127 80.379 C 275.243 68.813,263.295 58.404,254.135 66.447 M190.909 167.921 C 145.964 169.201,105.455 180.299,105.455 191.333 C 105.455 199.464,110.615 201.124,121.309 196.434 C 161.535 178.793,239.237 178.622,279.896 196.086 C 290.951 200.834,296.364 199.296,296.364 191.407 C 296.364 181.127,258.823 169.956,219.545 168.547 C 212.545 168.296,204.773 168.009,202.273 167.909 C 199.773 167.809,194.659 167.815,190.909 167.921`,
        get LOGO() {
            return `<svg id="bbgl-header-icon" xmlns="http://www.w3.org/2000/svg" viewBox="60 20 280 215" width="28" height="28" style="margin-right: 4px;">${ASSETS.GRADIENT}<g transform="scale(1, 1.15)"><path fill="url(#bbgl_silver_grad)" d="${this.LOGO_PATH}"></path></g></svg>`;
        },
        CLIPBOARD: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="100%" height="100%">${ASSETS.GRADIENT}<path fill="url(#bbgl_silver_grad)" d="M17,2.25V18H2V2.25H5.5l-2,2.106V16.5h12V4.356L13.543,2.25H17Zm-2.734,3L11.781,2.573V2.266A2.266,2.266,0,0,0,7.25,2.25v.323L4.777,5.25ZM9.5,1.5a.75.75,0,1,1-.75.75A.75.75,0,0,1,9.5,1.5ZM5.75,12.75h7.5v.75H5.75Zm0-.75h7.5v-.75H5.75Zm0-1.5h7.5V9.75H5.75Zm0-1.5h7.5V8.25H5.75Z"></path></svg>`,
        MINIMIZE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="bbgl-native-icon" aria-label="Minimize">${ASSETS.GRADIENT}<rect fill="url(#bbgl_silver_grad)" x="0" y="21" width="24" height="3"></rect></svg>`,
        POPOUT: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="24" height="24" class="bbgl-native-icon">${ASSETS.GRADIENT}<path fill="url(#bbgl_silver_grad)" d="M12,12H6V6h6ZM4.5,6.621V4.5H6.621L4.061,1.939,6,0H0V6L1.939,4.061ZM6.621,13.5H4.5V11.379L1.939,13.94,0,12v6H6L4.061,16.06ZM13.5,11.379V13.5H11.379l2.561,2.56L12,18h6V12l-1.94,1.94L13.5,11.379ZM12,0l1.94,1.939L11.379,4.5H13.5V6.621l2.56-2.561L18,6V0Z"></path></svg>`,
        COMPRESS: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="24" height="24" class="bbgl-native-icon">${ASSETS.GRADIENT}<g transform="translate(1290 304)"><path fill="url(#bbgl_silver_grad)" d="M-1277-291h6l-1.939,1.939,1.561,1.561-2.121,2.12-1.561-1.561L-1277-285Zm-9.94,4.06-1.561,1.561-2.12-2.12,1.561-1.561L-1291-291h6v6ZM-1284-292v-6h6v6Zm7-7v-6l1.939,1.94,1.561-1.561,2.121,2.121-1.561,1.561L-1271-299Zm-14,0,1.939-1.939-1.561-1.561,2.12-2.121,1.561,1.561L-1285-305v6Z"></path></g></svg>`,
        CHART: `<svg viewBox="0 0 24 24" fill="none"><line x1="4" y1="21.5" x2="4" y2="10.5" stroke="#536e8c" stroke-width="5" stroke-linecap="round"/><line x1="9.5" y1="21.5" x2="9.5" y2="2.5" stroke="#a64d42" stroke-width="5" stroke-linecap="round"/><line x1="15" y1="21.5" x2="15" y2="8" stroke="#b88645" stroke-width="5" stroke-linecap="round"/><line x1="20.5" y1="21.5" x2="20.5" y2="13.5" stroke="#547d51" stroke-width="5" stroke-linecap="round"/></svg>`,
        CHART_ALL: `<svg viewBox="0 -0.5 46 60" fill="none"><line x1="8" y1="40" x2="8" y2="30" stroke="#536e8c" stroke-width="9" stroke-linecap="round"/><line x1="18" y1="40" x2="18" y2="30" stroke="#a64d42" stroke-width="9" stroke-linecap="round"/><line x1="29" y1="40" x2="29" y2="30" stroke="#b88645" stroke-width="9" stroke-linecap="round"/><line x1="39" y1="40" x2="39" y2="30" stroke="#547d51" stroke-width="9" stroke-linecap="round"/><text x="23" y="57" text-anchor="middle" font-family="'Fjalla One', Arial Narrow, sans-serif" font-size="12" fill="#e6e6e6">All-Time</text></svg>`,
        LEDGER: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="18" height="20" rx="2" fill="none"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="17" y2="16"/></svg>`,
        GRAPH: `<svg viewBox="0 0 24 24"><path d="M3,12 L7,16 L13,6 L18,14 L22,8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        STICKERBOOK: `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.5" fill="none"/><circle cx="12" cy="5.5" r="3.5" fill="none"/><circle cx="18" cy="10" r="3.5" fill="none"/><circle cx="16" cy="17" r="3.5" fill="none"/><circle cx="8" cy="17" r="3.5" fill="none"/><circle cx="6" cy="10" r="3.5" fill="none"/></svg>`,
        LIBRARY: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="5" height="16" rx="1" fill="none"/><rect x="6" y="2.5" width="5.5" height="19.5" rx="1" fill="none"/><rect x="17.8" y="8" width="5.5" height="14" rx="1" fill="none" transform="rotate(-18 17.8 22)"/></svg>`,
        ACHIEVEMENTS: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" fill="none"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" fill="none"></path><path d="M4 22h16" fill="none"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" fill="none"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" fill="none"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" fill="none"></path></svg>`,
        PASTE: `<svg viewBox="0 0 24 24"><path d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2Z"/></svg>`,
        CHECK: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17 4 12" fill="none"/></svg>`,
        // Titles page — one shared crown for all 40 stat-title tiers, derived from LOGO_PATH's
        // silhouette subpath (not the level badge's own EXP_CROWN_PATH). Two geometric edits from
        // the source logo: the leg curves down to the base rim are extended taller, and the
        // spike/ball cluster is scaled 8% wider — both confirmed to introduce no seam kinks. The
        // silhouette winds counterclockwise starting at the top spike, so stroke-dashoffset
        // sweeping from full-length to 0 traces it cleanly.
        //
        // No pathLength/vector-effect: a pathLength-normalised dasharray stops animating once
        // vector-effect:non-scaling-stroke is applied to the same element, so this dashes against
        // the path's own real length instead (980.10 user units — re-measure if the path data below
        // ever changes, via arc-length integration) and fakes a constant stroke width via
        // --bbgl-t-star (see .bbgl-title-star-fill below).
        TITLE_CROWN: `<svg viewBox="47 5 307 217" fill="none"><path d="M193.132 22.044 C 181.137 27.985,178.771 45.621,188.766 54.592 C 192.860 58.266,192.797 58.939,187.236 70.810 C 160.809 127.227,139.426 132.713,96.187 94.170 C 89.016 87.778,88.968 87.704,90.098 84.744 C 95.207 71.365,76.527 57.225,64.916 65.683 C 54.502 73.267,60.796 91.707,74.374 93.393 C 86.535 126.777,87.611 127.407,88.243 129.069 C 89.543 132.488,100.349 172.625,104.966 191.182 C 107.267 200.432,109.322 208.494,109.532 209.099 C 109.800 209.869,111.627 209.423,115.639 207.608 C 154.845 189.875,247.090 189.878,286.205 207.613 C 293.432 210.890,291.721 213.896,299.107 184.950 C 311.947 134.626,314.454 126.636,317.401 126.636 C 336.733 93.636,345.351 79.275,340.775 70.347 C 332.390 53.985,304.856 68.675,311.874 85.767 C 314.350 91.794,276.778 117.463,263.445 118.855 C 245.763 120.700,228.905 103.733,213.296 68.380 L 208.768 58.124 212.234 55.097 C 228.702 40.716,212.398 12.503,193.132 22.044 Z" /></svg>`,
        CLOSE: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
        // Titles page — reverts a hand-picked title to the auto-follow pair. Only rendered while a
        // custom pick is actually active, so it doubles as the indicator that one exists.
        REFRESH: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-.6 4"/><path d="M20 4v7h-7"/></svg>`,
        // Titles page rank scale — stands in for a locked band's title text (achTitleLabelsHTML(),
        // 06-section-v-logic.js). Same stroke-outline family as the rest of the icon set rather than
        // the plaques' old engraved "?", since this now sits directly in plain text among the
        // unlocked bands' own labels instead of on an ornate plate of its own.
        LOCK: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
        // Achievements pagination prev/next (#bbgl-ach-footer, 07-section-vi-ui.js). Was a plain
        // Unicode "❮"/"❯" (U+276E/U+276F) glyph pair — replaced because those characters' actual
        // ink in Arial doesn't sit centred in their own line-box the way ordinary text does, which
        // only became visible once these needed pixel-precise vertical alignment against the
        // dots (--bbgl-ach-dot-y, layoutToolbarPaginationPosition()) rather than just looking fine on
        // their own. One path, reused for both directions — .bbgl-ach-next mirrors it with
        // transform:scaleX(-1) (04-section-iii-styles.js) rather than a second hand-drawn path, so
        // the two are guaranteed exact mirror images of each other with no separate alignment to
        // maintain.
        CHEVRON: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 6 9 12 15 18"/></svg>`
    };
    // A0 level badge: the script's own gray crown logo, reused as a CSS background-image
    // (data URI) so it can sit behind the level bar like the A2 diamond does.
    // The path here is modified to remove the bottom arch and halo for a completely solid flush bottom.
    const EXP_CROWN_PATH = "M193.636 22.044 C 182.529 27.985,180.338 45.621,189.593 54.592 C 193.384 58.266,193.325 58.939,188.176 70.810 C 163.707 127.227,143.908 132.713,103.872 94.170 C 97.232 87.778,97.187 87.704,98.234 84.744 C 102.964 71.365,85.668 57.225,74.917 65.683 C 65.274 73.267,71.102 91.707,83.674 93.393 C 86.535 93.777,87.611 94.407,88.243 96.069 C 89.543 99.488,100.349 139.625,104.966 158.182 C 107.267 167.432,109.322 175.494,109.532 176.099 C 109.800 176.869,111.627 176.423,115.639 174.608 L 286.205 174.613 C 293.432 177.890,291.721 180.896,299.107 151.950 C 311.947 101.626,314.454 93.636,317.401 93.636 C 326.599 93.636,334.579 79.275,330.342 70.347 C 322.578 53.985,297.084 68.675,303.582 85.767 C 305.874 91.794,271.086 117.463,258.740 118.855 C 242.368 120.700,226.759 103.733,212.306 68.380 L 208.113 58.124 211.323 55.097 C 226.571 40.716,211.474 12.503,193.636 22.044 M138.379 65.055 C 132.851 68.927,132.526 85.309,137.973 85.475 C 138.338 85.486,139.582 86.223,140.738 87.112 L 142.839 88.729 139.512 98.673 C 137.682 104.142,135.612 109.726,134.911 111.082 C 133.185 114.418,133.200 114.456,136.789 115.955 C 146.318 119.937,155.721 116.589,165.869 105.601 L 168.556 102.692 162.196 96.119 C 152.170 85.755,152.287 85.936,154.000 83.490 C 160.757 73.843,147.749 58.492,138.379 65.055 M254.135 66.447 C 249.029 70.930,247.780 79.527,251.606 83.864 C 253.281 85.763,253.294 85.744,242.310 97.108 L 235.000 104.671 239.263 108.569 C 247.293 115.913,255.483 117.954,264.959 114.973 C 271.221 113.003,271.405 112.722,269.230 108.440 C 267.406 104.849,262.723 90.706,262.733 88.817 C 262.736 88.218,263.983 87.019,265.504 86.154 C 267.186 85.196,268.997 82.935,270.127 80.379 C 275.243 68.813,263.295 58.404,254.135 66.447";
    const CROWN_BADGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="60 20 280 154.6" preserveAspectRatio="none">${ASSETS.GRADIENT}<g><path fill="url(#bbgl_silver_grad)" d="${EXP_CROWN_PATH}"></path></g></svg>`;
    const CROWN_BADGE_URL = `data:image/svg+xml,${encodeURIComponent(CROWN_BADGE_SVG)}`;
    const BAR_METAL_PALETTE = [[0, '#161616'], [22, '#353535'], [42, '#4b4b4b'], [50, '#555555'], [60, '#494949'], [80, '#2e2e2e'], [100, '#111111']];
    const CSS_STYLES = `


                                                /*============================    ============================*/
                                          /*==================================    ==================================*/
                                      /*======================================    ======================================*/
                                  /*==========================================    ==========================================*/
                                /*============================================================================================*/
                            /*====================================================================================================*/
                         /*==========================================================================================================*/
                      /*================================================================================================================*/
                    /*====================================================================================================================*/
                  /*========================================================================================================================*/
                /*============================================================================================================================*/
               /*==============================================================================================================================*/
              /*================================================================================================================================*/
             /*==================================================================================================================================*/
            /*====================================================================================================================================*/
            /*====================================================================================================================================*/
            /*====================================================================================================================================*/
            /*====================================================================================================================================*/
                    .bbgl-prefs-tab-title {
                        background-image: linear-gradient(rgb(85, 85, 85) 0%, rgb(51, 51, 51) 100%);
                        color: #fff;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        font-weight: 700;
                        line-height: 30px;
                        padding-left: 10px;
                        border: 1px solid #111;
                        border-bottom: 1px solid #000;
                        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1), 0 1px 0 #444;
                        border-radius: 5px 5px 0 0;
                        width: 100%;
                        box-sizing: border-box;
                        margin: 0;
                        z-index: 2;
                        position: relative;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 8px;
                        padding-right: 46px;
                    }

                    .bbgl-prefs-tab-title:first-child {
                        margin-top: 0;
                    }

                    .bbgl-tab-title-btn {
                        flex: 0 0 auto;
                        margin: 0;
                        width: 84px;
                        height: 18px;
                        line-height: 16px;
                        padding: 0;
                        text-align: center;
                        font-size: 10px;
                        border-radius: 3px;
                        background-image: linear-gradient(rgb(17, 17, 17) 0%, rgb(85, 85, 85) 25%, rgb(51, 51, 51) 60%, rgb(51, 51, 51) 78%, rgb(17, 17, 17) 100%);
                        color: #eee;
                        font-family: Arial, sans-serif;
                        font-weight: 700;
                        letter-spacing: .3px;
                        text-transform: uppercase;
                        border: 1px solid #111;
                        cursor: pointer;
                        box-sizing: border-box;
                    }

                    .bbgl-tab-title-btn:hover {
                        background-image: linear-gradient(rgb(51, 51, 51) 0%, rgb(119, 119, 119) 25%, rgb(51, 51, 51) 59%, rgb(102, 102, 102) 78%, rgb(51, 51, 51) 100%);
                        color: #fff;
                    }

                    .bbgl-tab-title-btn .bbgl-rs-done {
                        color: #43a047;
                    }

                    /* Expanded/page show the longer "RESYNC LOG"/"Syncing..." labels, which don't
                       fit the compact-mode width with comfortable padding — widen the button rather
                       than let its text crowd the edges. */
                    .bbgl-expanded .bbgl-tab-title-btn,
                    .bbgl-mode-page .bbgl-tab-title-btn {
                        width: 112px;
                    }

                    .bbgl-btn {
                        background-image: linear-gradient(rgb(17, 17, 17) 0%, rgb(85, 85, 85) 25%, rgb(51, 51, 51) 60%, rgb(51, 51, 51) 78%, rgb(17, 17, 17) 100%);
                        color: #eee;
                        font-family: "Fjalla One", Arial, serif;
                        font-size: 14px;
                        font-weight: 400;
                        line-height: 34px;
                        padding: 0;
                        border: 1px solid #111;
                        border-radius: 5px;
                        width: 100%;
                        height: 34px;
                        cursor: pointer;
                        text-align: center;
                        text-transform: uppercase;
                        box-sizing: border-box;
                        display: block;
                        transition: none;
                    }

                    .bbgl-btn:hover {
                        background-image: linear-gradient(rgb(51, 51, 51) 0%, rgb(119, 119, 119) 25%, rgb(51, 51, 51) 59%, rgb(102, 102, 102) 78%, rgb(51, 51, 51) 100%);
                        color: #fff;
                    }

                    .bbgl-btn:active {
                        background-image: linear-gradient(#000 0%, #333 100%);
                        color: #ddd;
                        box-shadow: rgba(255, 255, 255, .07) 0 -1px 0 0 inset;
                        border-color: #ddd;
                    }

                    /* Color-variant buttons share one gradient template; each variant
                       only supplies its palette. --btn-c1/c2/c3 = edge/highlight/body,
                       *h = hover palette, --btn-ca = active top stop. */
                    .bbgl-btn-green { --btn-c1: #0e1806; --btn-c2: #3e5e22; --btn-c3: #2b4216; --btn-c1h: #1a2e0b; --btn-c2h: #4f782b; --btn-c3h: #3a591e; --btn-ca: #080f03; }
                    .bbgl-btn-red { --btn-c1: #200505; --btn-c2: #701a1a; --btn-c3: #4f0e0e; --btn-c1h: #360808; --btn-c2h: #942222; --btn-c3h: #6e1313; --btn-ca: #140303; }
                    .bbgl-btn-purple { --btn-c1: #1a0529; --btn-c2: #6a1b9a; --btn-c3: #4a1070; --btn-c1h: #2a0840; --btn-c2h: #8e24aa; --btn-c3h: #6a1b9a; --btn-ca: #0f0318; }

                    .bbgl-btn-green,
                    .bbgl-btn-red,
                    .bbgl-btn-purple {
                        background-image: linear-gradient(var(--btn-c1) 0%, var(--btn-c2) 25%, var(--btn-c3) 60%, var(--btn-c3) 78%, var(--btn-c1) 100%) !important;
                        border-color: var(--btn-c1) !important;
                    }

                    .bbgl-btn-green:hover,
                    .bbgl-btn-red:hover,
                    .bbgl-btn-purple:hover {
                        background-image: linear-gradient(var(--btn-c1h) 0%, var(--btn-c2h) 25%, var(--btn-c3h) 60%, var(--btn-c3h) 78%, var(--btn-c1h) 100%) !important;
                    }

                    .bbgl-btn-green:active,
                    .bbgl-btn-red:active,
                    .bbgl-btn-purple:active {
                        background-image: linear-gradient(var(--btn-ca) 0%, var(--btn-c3) 100%) !important;
                        border-color: #555 !important;
                    }

                    .bbgl-settings-body {
                        background-color: #333;
                        border: 1px solid #111;
                        border-top: none;
                        border-radius: 0 0 5px 5px;
                        padding: 4px 0;
                        margin-bottom: 5px;
                        display: flex;
                        flex-direction: column;
                        box-shadow: inset 0 3px 5px rgba(0, 0, 0, .2);
                    }

                    .bbgl-setting-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px 10px;
                        background: 0 0;
                        border-bottom: 1px solid #1a1a1a;
                        box-shadow: 0 1px 0 #484848;
                        font-family: Arial, sans-serif;
                        font-size: 13px;
                        color: #ddd;
                    }

                    .bbgl-setting-row:last-child {
                        border-bottom: none;
                        box-shadow: none;
                    }

                    .bbgl-api-container {
                        position: relative;
                        width: 100%;
                        margin-bottom: 8px;
                    }

                    .bbgl-native-input {
                        width: 100%;
                        background: #333;
                        border: 1px solid #555;
                        color: #fff;
                        padding: 8px 30px;
                        font-family: 'Roboto Mono', monospace;
                        font-size: 12px;
                        border-radius: 4px;
                        box-sizing: border-box;
                    }

                    .bbgl-paste-icon {
                        position: absolute;
                        left: 4px;
                        top: 50%;
                        transform: translateY(-50%);
                        cursor: pointer;
                        width: 22px;
                        height: 22px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        user-select: none;
                        z-index: 15;
                    }

                    .bbgl-paste-icon svg {
                        fill: #888;
                        transition: fill .2s;
                        width: 14px;
                        height: 14px;
                    }

                    .bbgl-paste-icon:hover svg {
                        fill: #fff;
                    }

                    .bbgl-expanded .bbgl-paste-icon {
                        width: 26px;
                        height: 26px;
                    }

                    .bbgl-expanded .bbgl-paste-icon svg {
                        width: 17px;
                        height: 17px;
                    }

                    .bbgl-native-select {
                        background: #333;
                        color: #fff;
                        border: 1px solid #555;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        cursor: pointer;
                    }

                    .bbgl-switch {
                        position: relative;
                        display: inline-block;
                        width: 34px;
                        height: 18px;
                    }

                    .bbgl-switch input {
                        opacity: 0;
                        width: 0;
                        height: 0;
                    }

                    .slider {
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #444;
                        transition: .4s;
                        border-radius: 34px;
                    }

                    .slider:before {
                        position: absolute;
                        content: "";
                        height: 12px;
                        width: 12px;
                        left: 3px;
                        bottom: 3px;
                        background-color: #fff;
                        transition: .4s;
                        border-radius: 50%;
                    }

                    input:checked + .slider {
                        background-color: ${CONSTANTS.COLORS.GAINS};
                    }

                    input:checked + .slider:before {
                        transform: translateX(16px);
                    }

                    .bbgl-switch-purple {
                        transform: scale(.85);
                    }

                    .bbgl-switch-purple input:checked + .slider,
                    #bbgl-settings-view .bbgl-switch input:checked + .slider {
                        background-color: #6a1b9a;
                        box-shadow: 0 0 5px rgba(106, 27, 154, .6);
                    }

                    .bbgl-bestgym {
                        display: flex;
                        align-items: center;
                        justify-content: flex-end;
                        gap: 5px;
                        height: 24px;
                        line-height: 24px;
                        color: #999;
                        margin-top: 8px;
                    }

                    /* Gym page: sits in the empty top-right of the EXP bar top margin (30px, see
                       #bbgl-gym-level-container). Absolute, so the bar layout and size never move;
                       top -24px sits the 24px pill just above the bar. The container clip-path only
                       clips the sides and bottom, so the pill shows above the bar. */
                    #bbgl-gym-level-container .bbgl-bestgym {
                        position: absolute;
                        top: -24px;
                        right: 0;
                        z-index: 4;
                        margin-top: 0;
                    }

                    .bbgl-bestgym-logo {
                        width: 20px;
                        height: 20px;
                        flex-shrink: 0;
                    }

                    .bbgl-bestgym-label {
                        white-space: nowrap;
                        position: relative;
                        top: 1px;
                    }

                    .bbgl-subsetting {
                        padding-left: 26px;
                    }

                    .bbgl-row-disabled {
                        opacity: .45;
                        pointer-events: none;
                    }

                    .bbgl-bestgym-lead {
                        border-bottom: 1px solid rgba(255, 255, 255, .06);
                        box-shadow: none;
                    }

                    .bbgl-subgroup-row {
                        position: relative;
                        padding-left: 24px;
                    }

                    .bbgl-subgroup-row::before {
                        content: '';
                        position: absolute;
                        left: 10px;
                        top: 0;
                        bottom: 0;
                        width: 2px;
                        background: #555;
                    }

                    .bbgl-subgroup-row:not(.bbgl-subgroup-row-last) {
                        border-bottom: none;
                        box-shadow: none;
                    }

                    .bbgl-subgroup-row:not(.bbgl-subgroup-row-last)::after {
                        content: '';
                        position: absolute;
                        left: 10px;
                        right: 0;
                        bottom: 0;
                        height: 1px;
                        background: rgba(255, 255, 255, .06);
                    }

                    .bbgl-btn-grid {
                        display: flex;
                        gap: 0;
                        margin-bottom: 0;
                    }

                    .bbgl-btn-grid .bbgl-btn {
                        flex: 1;
                    }

                    .bbgl-btn-grid .bbgl-btn:first-of-type {
                        border-top-right-radius: 0;
                        border-bottom-right-radius: 0;
                        border-bottom-left-radius: 0;
                        border-right: none;
                    }

                    .bbgl-btn-grid .bbgl-btn:last-of-type {
                        border-top-left-radius: 0;
                        border-bottom-left-radius: 0;
                        border-bottom-right-radius: 0;
                    }

                    .close-settings-btn {
                        position: absolute;
                        background: transparent;
                        border: none;
                        color: rgba(80, 200, 120, .7);
                        cursor: pointer;
                        z-index: 200;
                        transition: all .2s;
                        user-select: none;
                        top: 12px;
                        right: 12px;
                        width: 22px;
                        height: 22px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                    }

                    .close-settings-btn svg {
                        width: 100%;
                        height: 100%;
                        filter: drop-shadow(0 2px 3px rgba(0, 0, 0, .5));
                        transition: all .2s;
                    }

                    .close-settings-btn:hover {
                        color: #69f0ae;
                        transform: scale(1.1);
                        filter: drop-shadow(0 0 6px rgba(105, 240, 174, .4));
                    }

                    .bbgl-close-x {
                        color: rgba(220, 80, 80, .7) !important;
                    }

                    .bbgl-close-x:hover {
                        color: #ff6b6b !important;
                        filter: drop-shadow(0 0 6px rgba(255, 100, 100, .4)) !important;
                    }

                    .bbgl-close-purple {
                        color: rgba(171, 71, 188, .7) !important;
                    }

                    .bbgl-close-purple:hover {
                        color: #ce93d8 !important;
                        filter: drop-shadow(0 0 6px rgba(171, 71, 188, .4)) !important;
                    }

                    .bbgl-expanded .close-settings-btn {
                        top: 12px;
                        right: 16px;
                        width: 25px;
                        height: 25px;
                    }

                    .bbgl-settings-body .bbgl-api-container {
                        margin: 8px 10px;
                        width: auto;
                    }

                    .bbgl-settings-body .bbgl-btn-grid {
                        margin: 8px 10px 0;
                    }

                    /* No active-state rule for our sidebar icon. Torn no longer lights its own
                       nav icons white on the active page, so BBGL deliberately doesn't either —
                       the selected state comes entirely from Torn's native bar/background
                       highlight, which syncSidebarState() reapplies by copying Torn's own hashed
                       active class onto our entry. Only the purple update-notification styling
                       below is ours. */

                    .bbgl-sb-notif [class*="desktopLink___"],
                    .bbgl-sb-notif [class*="mobileLink___"]:not(.sidebarMobileLink) {
                        background: linear-gradient(to right, rgba(171, 71, 188, .28), rgba(171, 71, 188, .12)) !important;
                    }

                    .bbgl-sb-notif [class*="defaultIcon___"] svg {
                        fill: url(#bbgl_notif_purple_grad) !important;
                        stroke: url(#bbgl_notif_purple_grad) !important;
                    }

                    .bbgl-sb-notif [class*="mobileLink___"] > span:not([class]) {
                        color: #d896e0 !important;
                    }

                    .bbgl-sb-notif {
                        position: relative;
                    }

                    .bbgl-sb-notif:not(:has(.sidebarMobileLink))::after {
                        content: '';
                        position: absolute;
                        top: 50%;
                        right: 10px;
                        transform: translateY(-50%);
                        width: 6px;
                        height: 6px;
                        border-radius: 100%;
                        background: linear-gradient(180deg, #d896e0, #ab47bc);
                        box-shadow: 0 1px 0 0 rgba(0, 0, 0, .25);
                    }

                    .bbgl-sb-notif:has(.sidebarMobileLink)::after {
                        content: '';
                        position: absolute;
                        top: 2px;
                        right: 2px;
                        width: 6px;
                        height: 6px;
                        border-radius: 100%;
                        background: linear-gradient(180deg, #d896e0, #ab47bc);
                        box-shadow: 0 1px 0 0 rgba(0, 0, 0, .25);
                    }

                    .bbgl-swiper-wr {
                        overflow: visible !important;
                        width: max-content !important;
                    }

                    .bbgl-swiper-cont {
                        overflow: visible !important;
                    }

                    #bbgl-page-container {
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        min-height: calc(100vh - 60px);
                        height: auto;
                        padding: 8px 0;
                        box-sizing: border-box;
                        container-type: inline-size;
                        container-name: bbgl-page;
                    }

                    .bbgl-native-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 0 0 8px;
                        margin-bottom: 15px;
                        border-bottom: 1px solid #444;
                        flex: 0 0 auto;
                        position: relative;
                    }

                    .bbgl-native-header::after {
                        content: "";
                        position: absolute;
                        bottom: -1px;
                        left: 0;
                        width: 100%;
                        height: 1px;
                        background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, .3) 50%, transparent 100%);
                    }

                    .bbgl-native-title {
                        font-family: Arial;
                        font-weight: 700;
                        font-size: 22px;
                        color: #999;
                        text-transform: capitalize;
                        letter-spacing: .1px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-left: -7px;
                        padding-left: 0;
                    }

                    .bbgl-native-links {
                        display: flex;
                        gap: 15px;
                        font-size: 18px;
                        color: #999;
                        font-weight: 700;
                    }

                    .bbgl-native-link {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        cursor: pointer;
                        transition: color .2s;
                    }

                    .bbgl-native-link:hover {
                        color: #ccc;
                    }

                    .bbgl-native-link svg {
                        width: 20px;
                        height: 20px;
                        fill: currentColor;
                    }

                    body.bbgl-page-mode-active #bbgl-page-container .bbgl-native-title {
                        font-size: clamp(21px, calc(21px + 1px * (100cqw - 280px) / 440px), 22px) !important;
                    }

                    body.bbgl-page-mode-active #bbgl-page-container #bbgl-page-demo-exit .bbgl-demo-x-label {
                        font-size: clamp(16px, calc(16px + 2px * (100cqw - 280px) / 440px), 18px) !important;
                    }

                    body.bbgl-page-mode-active #bbgl-page-container #bbgl-page-demo-exit svg {
                        width: clamp(20px, calc(24px - 4px * (100cqw - 280px) / 440px), 24px) !important;
                        height: clamp(20px, calc(24px - 4px * (100cqw - 280px) / 440px), 24px) !important;
                    }

                    #bbgl-panel {
                        --bbgl-f-label: 10px;
                        --bbgl-f-top: 10px;
                        --bbgl-f-bot: 9px;
                        --bbgl-f-top-mb: 1px;
                        --bbgl-bot-minh: 12px;
                        --bbgl-col-gap: 8px;
                        --bbgl-label-case: uppercase;
                        container-type: inline-size;
                        container-name: bbgl-panel;
                        -webkit-text-size-adjust: 100%;
                        text-size-adjust: 100%;
                        position: fixed;
                        bottom: ${LAYOUT.LIFT_HEIGHT}px;
                        right: 10px;
                        z-index: 999989;
                        font-family: Arial, sans-serif;
                        display: none;
                        flex-direction: column;
                        background: #2a2a2a;
                        border: 1px solid #444;
                        border-radius: 5px;
                        box-shadow: 0 -2px 4px rgba(0, 0, 0, .35);
                        width: 300px;
                        height: 438.5px;
                        max-height: calc(100vh - 50px) !important;
                        overflow-y: auto;
                        overflow-x: hidden;
                        /* No width/height transition: every --bbgl-dock-t size inside the panel reads the panel's width, so animating it re-laid-out the whole panel every frame. Size snaps. */
                    }

                    #bbgl-panel.bbgl-expanded {
                        --bbgl-f-label: clamp(13px, calc(13px + 1.5px * var(--bbgl-dock-t)), 14.5px);
                        --bbgl-f-top: clamp(13px, calc(13px + 1.5px * var(--bbgl-dock-t)), 14.5px);
                        --bbgl-f-bot: clamp(11px, calc(11px + 1.5px * var(--bbgl-dock-t)), 12.5px);
                        --bbgl-f-top-mb: 3px;
                        --bbgl-bot-minh: 14px;
                        --bbgl-label-case: none;
                        --bbgl-top-h: 241px;
                        /* Toolbar band height, and since #bbgl-toolbar's children all centre against it, the
                           icon row's vertical position in this mode. Derived, not eyeballed: it is the gap the
                           icons used to carry above them, plus the tallest SVG, plus that same gap again
                           (5.5 + 16 + 5.5). Centring in a band built that way lands the row on precisely the
                           top offset it had before it was centred, with matching clearance underneath. */
                        --bbgl-toolbar-h: 27px;
                        --bbgl-ledger-footer-pb: 4px;
                        /* Left inset of the icon row, and the even gap between its icons. The pad
                           mirrors #bbgl-copy-btn's right offset in this mode, so the band's two
                           clusters sit symmetrically against their edges. */
                        /* #bbgl-top-panel's own top padding. Named because the graph box subtracts
                           it to line its ceiling up with the bottom of the toolbar band. */
                        --bbgl-top-pt: 20px;
                        --bbgl-toolbar-pad: 10px;
                        /* Spacing between the view-switcher SVGs, the divider, and the first mode
                           pill. On -gaps like the band's other whitespace, but with a deliberately
                           short 2px travel: these are tap targets, and squeezing them together on a
                           narrow panel is where fat-fingering the wrong view starts. 9px still
                           separates them clearly, and five gaps at 2px is ~10px back into the band —
                           enough to help hold -min-gap at its floor without the row reading as
                           cramped. */
                        --bbgl-toolbar-gap: clamp(9px, calc(9px + 2px * var(--bbgl-t-gaps)), 11px);
                        /* Minimum clearance the band's space-between keeps between its left cluster
                           (icons + graph mode pills) and the right-hand stat pills. On -gaps (see
                           "Staged width curves" below) so it is spent before the pills give up any
                           type size — it was fully rigid before, which meant the pills paid first. */
                        --bbgl-toolbar-min-gap: clamp(8px, calc(8px + 4px * var(--bbgl-t-gaps)), 12px);
                        width: min(576px, calc(100vw - 20px));
                        height: 633px;
                        max-height: calc(100vh - 50px) !important;
                        overflow-y: auto;
                        overflow-x: hidden;
                    }

                    /* #bbgl-top-panel's non-flow (position:absolute) height and #bbgl-bottom-panel/
                       #bbgl-item-viewer's offset both read this one variable, so the header can
                       never change height without the panels beneath it staying put in lockstep -
                       see the #bbgl-top-panel rules below for how it's consumed. */
                    #bbgl-panel.bbgl-compact {
                        /* These four were on .bbgl-tall, which matched compact and expanded alike -
                           but expanded overrode every one of them, so compact was the only mode they
                           ever reached. They belong here now: left at panel level they would sit after
                           .bbgl-expanded at equal specificity and win by source order. */
                        --bbgl-f-label: 11px;
                        --bbgl-f-top: 11px;
                        --bbgl-f-bot: 10px;
                        --bbgl-col-gap: 13px;
                        --bbgl-top-h: 40%;
                        /* 5.5 + 14 + 5.5, same derivation as --bbgl-toolbar-h on .bbgl-expanded above. */
                        --bbgl-toolbar-h: 25px;
                        --bbgl-ledger-footer-pb: 3px;
                        --bbgl-top-pt: 18px;
                        --bbgl-toolbar-pad: 8px;
                        /* 9px, the same tap-target floor expanded and page use: at 11px the graph band
                           ran 18px short once the Library icon joined the row. */
                        --bbgl-toolbar-gap: 9px;
                        --bbgl-toolbar-min-gap: 12px;
                    }

                    /* The other 6px of that shortfall, taken only where the stat pills exist. */
                    #bbgl-panel.bbgl-compact #bbgl-top-panel.viewing-graph #bbgl-toolbar {
                        --bbgl-toolbar-min-gap: 6px;
                    }

                    #bbgl-panel.bbgl-mode-page {
                        /* Page mode scaled both the icons (14.5px -> 18px) and their old top offset
                           (4.5px -> 10px) along --bbgl-page-t, so the band tracks that same curve through the
                           same gap + SVG + gap derivation: 4.5 + 14.5 + 4.5 = 23.5 at the low end, 10 + 18 + 10
                           = 38 at the high end. */
                        --bbgl-toolbar-h: clamp(23.5px, calc(23.5px + 14.5px * var(--bbgl-page-t)), 38px);
                        --bbgl-ledger-footer-pb: clamp(4px, calc(4px + 2px * var(--bbgl-page-t)), 6px);
                        --bbgl-sticker-footer-h: clamp(20px, calc(20px + 10px * var(--bbgl-page-t)), 30px);
                        --bbgl-sticker-footer-gap: clamp(2px, calc(2px + 2px * var(--bbgl-page-t)), 4px);
                        --bbgl-sticker-row-gap: clamp(4px, calc(4px + 4px * var(--bbgl-page-t)), 8px);
                        /* Page mode grows its header padding with --bbgl-page-t rather than holding
                           the 2px base, so the graph box subtracts the same curve the header is laid
                           out against - see #bbgl-panel.bbgl-mode-page #bbgl-top-panel above, which
                           reads this now instead of restating the clamp. */
                        --bbgl-top-pt: clamp(2px, calc(2px + 18px * var(--bbgl-page-t)), 20px);
                        --bbgl-toolbar-pad: 12px;
                        /* On -gaps, with the same 9px tap-target floor as expanded (see that block).
                           Page mode's top stays higher because it has the room at full width. */
                        --bbgl-toolbar-gap: clamp(9px, calc(9px + 5px * var(--bbgl-t-gaps)), 14px);
                        /* On -gaps, same staging and the same floor as expanded (see the "Staged
                           width curves" block). The top stays higher than expanded's because page
                           mode has the room at full width; what it did not have was anywhere to go
                           at the narrow end — fully rigid at 16px, at exactly the widths where the
                           pills were already running out of room and being clipped. */
                        --bbgl-toolbar-min-gap: clamp(8px, calc(8px + 8px * var(--bbgl-t-gaps)), 16px);
                        position: relative !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: auto !important;
                        bottom: auto;
                        width: 100% !important;
                        flex: none;
                        max-width: none;
                        height: auto !important;
                        max-height: none !important;
                        border: 1px solid #444;
                        border-radius: 5px;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, .5);
                        box-sizing: border-box;
                        background: #2a2a2a;
                        display: flex !important;
                        flex-direction: column;
                        gap: 0;
                        z-index: 1 !important;
                        overflow-x: hidden !important;
                        overflow-y: visible !important;
                        --bbgl-label-case: none !important;
                        --bbgl-page-t: clamp(0, calc((100cqi - 300px) / 370px), 1);
                        --bbgl-f-label: clamp(10.75px, calc(10.75px + 5.25px * var(--bbgl-page-t)), 16px);
                        --bbgl-f-top: clamp(10.75px, calc(10.75px + 6.25px * var(--bbgl-page-t)), 17px);
                        --bbgl-f-bot: clamp(9px, calc(9px + 5px * var(--bbgl-page-t)), 14px);
                        --bbgl-f-top-mb: clamp(2px, calc(2px + 2px * var(--bbgl-page-t)), 4px);
                        --bbgl-bot-minh: clamp(12px, calc(12px + 4px * var(--bbgl-page-t)), 16px);
                        --bbgl-col-gap: clamp(6px, calc(6px + 20px * var(--bbgl-page-t)), 26px);
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-weekly-anchor {
                        --bbgl-track-h: clamp(12px, calc(12px + 3px * var(--bbgl-page-t)), 15px);
                        height: var(--bbgl-track-h);
                    }
                    #bbgl-panel.bbgl-mode-page .bbgl-weekly-track {
                        height: var(--bbgl-track-h);
                    }

                    .bbgl-mode-page .bbgl-header {
                        display: none !important;
                    }

                    .bbgl-mode-page #bbgl-content-wrapper {
                        display: contents !important;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-top-panel {
                        flex: 0 0 clamp(180px, calc(180px + 90px * var(--bbgl-page-t)), 270px);
                        height: clamp(180px, calc(180px + 90px * var(--bbgl-page-t)), 270px);
                        width: 100%;
                        margin-bottom: 0;
                        border: none;
                        border-bottom: 1px solid #444;
                        border-radius: 0;
                        display: flex;
                        flex-direction: column;
                        padding-top: var(--bbgl-top-pt, 2px) !important;
                        overflow: hidden !important;
                        box-shadow: inset 0 0 40px rgba(0, 0, 0, .95);
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-header-wrapper {
                        flex: 0 0 clamp(108px, calc(108px + 89px * var(--bbgl-page-t)), 197px);
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-month-header {
                        padding-left: clamp(14px, calc(14px + 3px * var(--bbgl-page-t)), 17px);
                        padding-right: clamp(16px, calc(16px + 16px * var(--bbgl-page-t)), 32px);
                        gap: clamp(8px, calc(8px + 8px * var(--bbgl-page-t)), 16px);
                        margin-bottom: clamp(4px, calc(4px + 4px * var(--bbgl-page-t)), 8px);
                        padding-bottom: clamp(3px, calc(3px + 3px * var(--bbgl-page-t)), 6px);
                    }

                    .bbgl-mode-page #bbgl-bottom-panel {
                        flex: none !important;
                        width: 100%;
                        border: none;
                        border-radius: 0;
                        background: 0 0;
                        min-height: 0;
                        display: flex;
                        flex-direction: column;
                        height: auto;
                        overflow: visible !important;
                    }

                    .bbgl-mode-page #bbgl-settings-view {
                        flex: none;
                        height: auto;
                    }

                    .bbgl-mode-page .bbgl-settings-scroll-area {
                        overflow-y: visible;
                        height: auto;
                        flex: none;
                    }

                    .bbgl-mode-page:has(#bbgl-settings-view.active-view) {
                        flex: none;
                    }

                    .bbgl-mode-page:has(#bbgl-settings-view.active-view) #bbgl-bottom-panel {
                        flex: none;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-grid-container {
                        height: auto;
                        flex: none;
                        padding: 0 clamp(2px, calc(2px + 2px * var(--bbgl-page-t)), 4px) clamp(1px, calc(1px + 3px * var(--bbgl-page-t)), 4px) clamp(2px, calc(2px + 2px * var(--bbgl-page-t)), 4px);
                        overflow: visible !important;
                    }

                    .bbgl-mode-page .calendar-wrapper {
                        height: auto !important;
                        flex: none !important;
                        overflow: hidden !important;
                    }

                    .bbgl-mode-page .bbgl-cal-container {
                        height: auto;
                        display: flex;
                        flex-direction: column;
                    }

                    .bbgl-mode-page .bbgl-row-slice {
                        flex: none;
                        width: 100%;
                    }

                    .bbgl-mode-page .bbgl-day-cell {
                        aspect-ratio: 1/1;
                        height: auto;
                        width: 100% !important;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-achievements-container {
                        --bbgl-ach-container-pt: clamp(19px, calc(28px - 9px * var(--bbgl-page-t)), 28px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-ach-footer {
                        --bbgl-ach-dot-gap: clamp(5px, calc(5px + 3px * var(--bbgl-page-t)), 8px);
                        --bbgl-ach-dot-w: clamp(6px, calc(6px + 2px * var(--bbgl-page-t)), 8px);
                        --bbgl-ach-nav-size: clamp(7px, calc(1.3 * var(--bbgl-ach-dot-w)), 11px);
                        --bbgl-ach-nav-py: clamp(3px, calc(3px + 1px * var(--bbgl-page-t)), 4px);
                        --bbgl-ach-nav-px: clamp(4px, calc(4px + 4px * var(--bbgl-page-t)), 10px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-ach-pageindicator .pg-dot {
                        width: var(--bbgl-ach-dot-w);
                        height: var(--bbgl-ach-dot-w);
                    }

                    #bbgl-panel.bbgl-mode-page .col-header,
                    #bbgl-panel.bbgl-mode-page .col-data-block {
                        margin-bottom: calc(8px * (1 - var(--bbgl-page-t)));
                    }

                    #bbgl-panel.bbgl-mode-page .day-num {
                        --day-num-size: clamp(22px, calc(22px + 14px * var(--bbgl-page-t)), 36px);
                        top: clamp(2px, calc(2px + 4px * var(--bbgl-page-t)), 6px);
                        left: clamp(2px, calc(2px + 4px * var(--bbgl-page-t)), 6px);
                        font-size: clamp(10px, calc(10px + 8px * var(--bbgl-page-t)), 18px);
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-day-cell.is-viewing .day-num {
                        --day-num-size: clamp(26px, calc(26px + 14px * var(--bbgl-page-t)), 40px);
                        font-size: clamp(14px, calc(14px + 10px * var(--bbgl-page-t)), 24px) !important;
                    }

                    #bbgl-panel.bbgl-mode-page .ui-floating-label,
                    #bbgl-panel.bbgl-mode-page .ui-floating-summary {
                        font-size: clamp(9px, calc(9px + 6px * var(--bbgl-page-t)), 15px);
                        bottom: clamp(4px, calc(4px + 2px * var(--bbgl-page-t)), 6px);
                    }

                    @container bbgl-panel (max-width:499px) {

                        #bbgl-panel.bbgl-mode-page .bbgl-header-wrapper,
                        #bbgl-panel.bbgl-mode-page #bbgl-graph-container,
                        #bbgl-panel.bbgl-mode-page #bbgl-cal-container {
                            will-change: transform;
                        }
                    }

                    .bbgl-mode-page #bbgl-close-btn,
                    .bbgl-mode-page #bbgl-pop-btn {
                        display: none !important;
                    }

                    body.bbgl-page-mode-active {
                        overflow-x: hidden !important;
                    }

                    body.bbgl-page-mode-active #graph,
                    body.bbgl-page-mode-active .tt-container.tt-theme-background.collapsible {
                        display: none !important;
                    }

                    #bbgl-gym-tab {
                        background-image: linear-gradient(180deg, #00698c, #003040) !important;
                        color: #fff !important;
                        border: .1px solid #002431 !important;
                        border-bottom: none !important;
                        border-radius: 5px 5px 0 0 !important;
                        box-shadow: rgba(255, 255, 255, .25) 0 0 4px 0 inset, rgba(0, 0, 0, .5) 0 -2px 4px 0 !important;
                        width: 38px !important;
                        height: 38px !important;
                        min-width: 38px !important;
                        max-width: 38px !important;
                        flex: 0 0 38px !important;
                        box-sizing: border-box !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        margin: 0 -1px 0 -.4px !important;
                        padding: 0 !important;
                        cursor: pointer !important;
                        position: relative !important;
                        z-index: -10 !important;
                        transform: none !important;
                        pointer-events: auto !important;
                    }

                    #bbgl-gym-tab svg {
                        margin: 0 !important;
                        display: block;
                        transition: filter .2s ease;
                        filter: drop-shadow(rgba(0, 0, 0, .8) 0 0 2px);
                    }

                    #bbgl-gym-tab:hover {
                        background-image: linear-gradient(#0099cc, #004d66) !important;
                    }

                    #bbgl-gym-tab:hover svg,
                    #bbgl-gym-tab.bbgl-tab-active svg {
                        filter: brightness(1.1) drop-shadow(rgba(0, 0, 0, .8) 0 0 2px);
                    }

                    #bbgl-gym-tab.bbgl-tab-active {
                        background-image: linear-gradient(to bottom, #001F2B 0%, #003E53 100%) !important;
                        box-shadow: inset 0 1px 0 0 #1a353f, rgba(0, 0, 0, .5) 0 -2px 4px 0 !important;
                        border: none !important;
                        padding: 1px 1px 0 !important;
                    }

                    #bbgl-gym-tab.bbgl-tab-active:hover {
                        background-image: linear-gradient(180deg, #003040, #00698c) !important;
                    }

                    .bbgl-animate-pop {
                        animation: bbgl-genie-pop .3s cubic-bezier(.2, 1, .3, 1) forwards;
                    }

                    .bbgl-animate-vanish {
                        animation: bbgl-genie-vanish .2s ease-in forwards;
                        pointer-events: none;
                    }

                    @keyframes bbgl-genie-pop {
                        0% {
                            transform: scale(0);
                            opacity: 0
                        }

                        100% {
                            transform: scale(1);
                            opacity: 1
                        }
                    }

                    @keyframes bbgl-genie-vanish {
                        0% {
                            transform: scale(1);
                            opacity: 1
                        }

                        100% {
                            transform: scale(0);
                            opacity: 0
                        }
                    }

                    .bbgl-header {
                        background-image: linear-gradient(#00698c, #003040);
                        color: #fff;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        font-weight: 700;
                        padding: 0 8px;
                        border-bottom: 1px solid #000;
                        border-radius: 5px 5px 0 0;
                        box-shadow: rgba(255, 255, 255, .25) 0 0 4px 0 inset, rgba(0, 0, 0, .5) 0 -2px 4px 0;
                        width: 100%;
                        height: 38px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        box-sizing: border-box;
                        cursor: pointer;
                        position: relative;
                        z-index: 50;
                        user-select: none;
                    }

                    .bbgl-header:hover {
                        background-image: linear-gradient(#0099cc, #004d66);
                    }

                    #bbgl-header-icon {
                        transition: filter .2s;
                        filter: drop-shadow(rgba(0, 0, 0, .25) 0 0 2px);
                    }

                    .bbgl-header:hover #bbgl-header-icon {
                        filter: brightness(1.1) drop-shadow(rgba(0, 0, 0, .25) 0 0 2px);
                    }

                    .bbgl-header-left {
                        display: flex;
                        align-items: center;
                        pointer-events: none;
                    }

                    .bbgl-header-text {
                        margin-left: 2px;
                        font-weight: 700;
                    }

                    .bbgl-short-title {
                        display: inline;
                    }

                    .bbgl-long-title {
                        display: none;
                    }

                    .bbgl-expanded .bbgl-short-title {
                        display: none;
                    }

                    .bbgl-expanded .bbgl-long-title {
                        display: inline;
                    }

                    .bbgl-header-right {
                        display: flex;
                        align-items: center;
                    }

                    .bbgl-custom-icon {
                        font-size: 22px;
                        color: #c0c0c0;
                        cursor: pointer;
                        margin: 0 6px;
                        font-weight: 700;
                        transition: color .2s;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 26px;
                        height: 26px;
                    }

                    .bbgl-custom-icon:hover {
                        color: #fff;
                    }

                    #bbgl-close-btn {
                        margin-left: 12px;
                        margin-right: 16px;
                        position: relative;
                        top: -.5px;
                        left: -.5px;
                    }

                    #bbgl-pop-btn {
                        margin-left: 0;
                        position: relative;
                        top: .5px;
                        left: .5px;
                    }

                    #bbgl-pop-btn svg {
                        pointer-events: bounding-box;
                    }

                    .bbgl-native-icon {
                        cursor: pointer;
                        opacity: 1;
                        transition: filter .2s;
                        filter: drop-shadow(rgba(0, 0, 0, .25) 0 0 2px);
                    }

                    .bbgl-native-icon:hover {
                        filter: brightness(1.1) drop-shadow(rgba(0, 0, 0, .25) 0 0 2px);
                    }

                    #bbgl-tooltip {
                        position: fixed;
                        background-color: #464646;
                        color: #ddd;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.5;
                        padding: 6px 8px;
                        border-radius: 5px;
                        box-shadow: none;
                        filter: drop-shadow(0 0 1px rgba(0, 0, 0, .5));
                        z-index: 1000000;
                        pointer-events: none;
                        /* Own compositor layer: without it every show/move/hide as the mouse crosses the
                           grid also repainted the panel content under the tooltip's box (scaled
                           calendar JPGs, stickers, week bars), not just the tooltip itself. */
                        will-change: transform;
                        display: none;
                        white-space: normal;
                        box-sizing: border-box;
                        height: auto;
                        width: -moz-fit-content;
                        width: fit-content;
                        max-width: 280px;
                    }

                    #bbgl-tooltip strong {
                        color: #fff;
                        font-weight: 700;
                    }

                    #bbgl-tooltip i {
                        display: block;
                        margin-top: 4px;
                        color: #bbb;
                        font-style: italic;
                        font-size: 11px;
                        font-weight: 400;
                    }

                    #bbgl-tooltip.is-level-title {
                        background: none;
                        padding: 0;
                        border-radius: 0;
                        filter: none;
                        max-width: 268px;
                    }

                    #bbgl-tooltip.is-level-title #bbgl-tooltip-arrow {
                        display: none;
                    }

                    .bbgl-level-title-tooltip {
                        position: relative;
                        --bbgl-t-fs-name: 15px;
                        --bbgl-t-name-scale: 1.45;
                        --bbgl-t-fs-line: 9px;
                        --bbgl-t-fs-line-label: 6px;
                        --bbgl-t-gap: 3px;
                        --bbgl-t-gap-v: 3px;
                        --bbgl-t-win-color: #a855f7;
                        --bbgl-t-win-glow: .8;
                        --bbgl-t-win-hum: 11.3s;
                        --bbgl-t-wire-h: 8px;
                        --bbgl-t-wire-lift: 4px;
                        width: 268px;
                        padding: 37px 8px 8px;
                        border: 1px solid rgba(145, 115, 176, .32);
                        border-radius: 6px;
                        background:
                            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(126, 66, 183, .20), transparent 72%),
                            linear-gradient(180deg, #202126, #111216);
                        box-shadow: 0 3px 10px rgba(0, 0, 0, .65), inset 0 1px 0 rgba(255, 255, 255, .08);
                        box-sizing: border-box;
                    }

                    .bbgl-tooltip-rank-progress {
                        margin: 9px 18px 0;
                        font: 10px/1.3 'Barlow Condensed', sans-serif;
                        color: #c8c4ce;
                        text-align: center;
                    }
                    .bbgl-tooltip-level-readout { color: #eee9f2; font-size: 12px; }
                    .bbgl-tooltip-rank-track {
                        position: relative;
                        height: 1px;
                        margin: 7px 0 5px;
                        background: #8a7b99;
                    }
                    .bbgl-tooltip-rank-track::before,
                    .bbgl-tooltip-rank-track::after {
                        content: '';
                        position: absolute;
                        top: -3px;
                        width: 1px;
                        height: 7px;
                        background: #b7a6ca;
                    }
                    .bbgl-tooltip-rank-track::before { left: 0; }
                    .bbgl-tooltip-rank-track::after { right: 0; }
                    .bbgl-tooltip-rank-track > span {
                        position: absolute;
                        left: var(--rank-progress);
                        top: 50%;
                        width: 5px;
                        height: 5px;
                        border-radius: 50%;
                        background: #d5b4f5;
                        box-shadow: 0 0 0 1px #25202c;
                        transform: translate(-50%, -50%);
                    }
                    /* Lv start | level readout | Lv end on one row under the rank track. Baseline
                       aligned so the larger readout lines up with the smaller endpoint labels. */
                    .bbgl-tooltip-rank-endpoints { display: flex; justify-content: space-between; align-items: baseline; }

                    .bbgl-level-title-tooltip .bbgl-titles-center {
                        flex: 1 1 auto;
                        width: auto;
                        min-width: 0;
                        height: 132px;
                        margin: 0;
                        transform: none;
                    }

                    /* In-progress stat emblems flanking the identity card: str+spd left,
                       def+dex right, same grouping as the titles page. */
                    .bbgl-tooltip-identity-row {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }
                    .bbgl-tooltip-emblem-col {
                        flex: 0 0 40px;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-around;
                        align-self: stretch;
                    }
                    .bbgl-tooltip-emblem {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 3px;
                    }
                    .bbgl-tooltip-emblem .bbgl-stat-emblem {
                        width: 36px;
                        height: 27px;
                        transform: none;
                    }
                    .bbgl-tooltip-emblem.ach-stat-str { --bbgl-t-win-color: #3264c6; }
                    .bbgl-tooltip-emblem.ach-stat-def { --bbgl-t-win-color: #dc3912; }
                    .bbgl-tooltip-emblem.ach-stat-spd { --bbgl-t-win-color: #ff9900; }
                    .bbgl-tooltip-emblem.ach-stat-dex { --bbgl-t-win-color: #109618; }
                    .bbgl-tooltip-emblem.is-unlocked .bbgl-stat-emblem {
                        color: color-mix(in srgb, var(--bbgl-t-win-color) 65%, #84919d);
                    }
                    .bbgl-tooltip-emblem.is-unlocked .bbgl-emblem-gloss { opacity: .85; }
                    .bbgl-tooltip-emblem.is-unlocked .bbgl-emblem-detail {
                        stroke: #d6dce0;
                        opacity: .75;
                    }
                    .bbgl-tooltip-emblem-pct {
                        font: 11.5px/1 'Fjalla One', 'Arial Narrow', sans-serif;
                        letter-spacing: .02em;
                        white-space: nowrap;
                        color: color-mix(in srgb, var(--bbgl-t-win-color) 45%, #eee9f2);
                    }

                    .bbgl-level-title-tooltip .bbgl-tooltip-player-name {
                        position: absolute;
                        top: 5px;
                        left: 2px;
                        right: 2px;
                        width: auto;
                        max-width: none;
                        transform: none;
                        padding-left: .2em;
                        padding-right: .2em;
                        text-align: center;
                    }

                    .bbgl-level-title-tooltip .bbgl-title-card {
                        width: 135.88px;
                        max-width: 100%;
                        flex: 1 1 auto;
                        align-self: center;
                    }

                    /* Title text matches the expanded titles page: --bbgl-tip-title-fs is its
                       measured px, set on the root by layoutTitleBlockFrames() (07-section-vi-ui.js).
                       Until that page has been laid out, the normal plaque-relative size applies.
                       line-height restores the plaque value that .bbgl-lvl-title.bbgl-titles-title
                       (1.55, later in the file) overrides; its extra leading opened a gap under The. */
                    #bbgl-tooltip .bbgl-level-title-tooltip .bbgl-titles-title {
                        font-style: normal;
                        font-size: var(--bbgl-tip-title-fs, min(14cqw, 25cqh));
                        line-height: 1.05;
                    }

                    /* Title finish progression, Phase 0-9 — dull silver to iridescent diamond.
                       Scoped to the individual WORD, not the whole title: the two slots are chosen
                       independently, so a Phase 1 adjective can sit next to a Phase 8 noun and each
                       shows its own tier. Each phase only overrides color/text-shadow (Phase 9 swaps
                       to a clipped animated gradient) on top of the shared rule above.
                       Blocks: grey 0-3, green 4-6, gold 7-8, iridescent 9. */
                    /* inline-block so the Phase 9 gradient below gets its own painting box to
                       clip against rather than inheriting the whole line's. */
                    .bbgl-title-word {
                        display: inline-block;
                    }

                    /* Grey block (0-3): dead matte to bright silver. Lightness and glow both climb
                       every step — the old ramp peaked at Phase 2 and then DIMMED into a greenish
                       grey at Phase 3, so a promotion could visibly look like a demotion. */
                    .bbgl-title-word[data-title-phase="0"] {
                        color: #6f7276;
                        text-shadow: none;
                    }

                    .bbgl-title-word[data-title-phase="1"] {
                        color: #878b90;
                        text-shadow: 0 0 2px rgba(255, 255, 255, 0.12);
                    }

                    .bbgl-title-word[data-title-phase="2"] {
                        color: #a2a8ae;
                        text-shadow: 0 0 2px rgba(255, 255, 255, 0.22);
                    }

                    .bbgl-title-word[data-title-phase="3"] {
                        color: #c2c9d0;
                        text-shadow: 0 0 3px rgba(255, 255, 255, 0.35);
                    }

                    /* Green block (4-6): entering hue for the first time reads as the promotion, so
                       Phase 4 starts soft rather than at full saturation and builds from there. */
                    .bbgl-title-word[data-title-phase="4"] {
                        color: #6fcf8a;
                        text-shadow: 0 0 3px rgba(111, 207, 138, 0.4);
                    }

                    .bbgl-title-word[data-title-phase="5"] {
                        color: #4ddb7c;
                        text-shadow: 0 0 4px rgba(77, 219, 124, 0.55);
                    }

                    .bbgl-title-word[data-title-phase="6"] {
                        color: #38e86a;
                        text-shadow: 0 0 3px rgba(56, 232, 106, 0.7), 0 0 9px rgba(56, 232, 106, 0.38);
                    }

                    /* Gold block (7-8): 7 is the yellow-green hand-off into gold, 8 the peak gold
                       right before the iridescent capstone. */
                    .bbgl-title-word[data-title-phase="7"] {
                        color: #b9e05a;
                        text-shadow: 0 0 3px rgba(185, 224, 90, 0.6), 0 0 9px rgba(255, 204, 68, 0.3);
                    }

                    .bbgl-title-word[data-title-phase="8"] {
                        color: #ffe066;
                        text-shadow: 0 0 4px rgba(255, 224, 102, 0.75), 0 0 12px rgba(255, 204, 68, 0.45);
                    }

                    .bbgl-title-word[data-title-phase="9"] {
                        background: linear-gradient(90deg, #ffffff, #66eaff, #ff8fd6, #ffe066, #66eaff, #ffffff);
                        background-size: 400% 100%;
                        -webkit-background-clip: text;
                        background-clip: text;
                        color: transparent;
                        text-shadow: none;
                        filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
                        animation: bbgl-title-iridescent 3s linear infinite;
                        animation-delay: var(--bbgl-titles-animation-delay, 0ms);
                    }

                    @keyframes bbgl-title-iridescent {
                        0% { background-position: 0% 50%; }
                        100% { background-position: 400% 50%; }
                    }

                    .tt-header {
                        color: #999;
                        font-weight: 700;
                        border-bottom: 1px solid #555;
                        padding-bottom: 4px;
                        margin-bottom: 6px;
                        text-align: center;
                        font-size: 11px;
                        letter-spacing: .5px;
                    }

                    .tt-energy {
                        text-align: center;
                        margin-bottom: 6px;
                        color: #ddd;
                        font-size: 11px;
                        font-weight: 700;
                    }

                    .tt-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 15px;
                        font-size: 11px;
                        margin-bottom: 2px;
                    }

                    .tt-label {
                        color: #ccc;
                    }

                    .tt-val {
                        color: ${CONSTANTS.COLORS.GAINS};
                        font-weight: 700;
                    }

                    .tt-total {
                        color: #fff;
                        font-weight: 700;
                    }

                    .tt-sub {
                        font-size: 10px;
                        color: #999;
                    }

                    #bbgl-tooltip-arrow {
                        position: absolute;
                        width: 0;
                        height: 0;
                        border: 10px solid transparent;
                        pointer-events: none;
                        z-index: 1000001;
                    }

                    #bbgl-tooltip.pos-top #bbgl-tooltip-arrow {
                        border-top-color: #444;
                        bottom: -20px;
                        left: 50%;
                        margin-left: -10px;
                    }

                    #bbgl-tooltip.pos-bottom #bbgl-tooltip-arrow {
                        border-bottom-color: #444;
                        top: -20px;
                        left: 50%;
                        margin-left: -10px;
                    }

                    #bbgl-tooltip.pos-left #bbgl-tooltip-arrow {
                        border-left-color: #444;
                        right: -20px;
                        top: 50%;
                        margin-top: -10px;
                    }

                    #bbgl-tooltip.pos-right #bbgl-tooltip-arrow {
                        border-right-color: #444;
                        left: -20px;
                        top: 50%;
                        margin-top: -10px;
                    }

                    #bbgl-demo-exit {
                        background-color: #4a1070;
                        background-image: linear-gradient(180deg, #1a0529 0%, #6a1b9a 25%, #4a1070 60%, #4a1070 78%, #1a0529 100%);
                        color: #fff;
                        font-family: "Fjalla One", Arial, sans-serif;
                        font-size: 10px;
                        font-weight: 400;
                        letter-spacing: 1.5px;
                        text-align: center;
                        padding: 4px 0;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .12), inset 0 -1px 0 rgba(0, 0, 0, .6);
                        user-select: none;
                        flex-shrink: 0;
                        transition: background-image .2s;
                        border-top: 1px solid #1a0529;
                        border-bottom: 1px solid #111;
                        width: 100%;
                        border-radius: 0;
                    }

                    #bbgl-demo-exit:hover {
                        background-image: linear-gradient(180deg, #2a0840 0%, #8e24aa 25%, #6a1b9a 60%, #6a1b9a 78%, #2a0840 100%);
                    }

                    /* Panel mode only: #bbgl-bottom-panel is the scroll container here (see its
                       overflow-y:auto rule below), and #bbgl-demo-exit is its first child, so
                       sticking it to the top of that box keeps it pinned at the boundary with
                       #bbgl-top-panel as the calendar scrolls underneath — instead of scrolling
                       away with the rest of the header/grid content. In tall mode #bbgl-top-panel's
                       existing negative margin-bottom (z-index:25) overlaps this bar, producing the
                       "hanging off the top panel" look for free. Page mode leaves it static (its
                       #bbgl-bottom-panel doesn't scroll internally there). */
                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-demo-exit {
                        position: sticky;
                        top: 0;
                        z-index: 22;
                    }

                    #bbgl-demo-exit:active {
                        background-image: linear-gradient(0deg, #8e24aa 0%, #6a1b9a 100%);
                    }

                    .bbgl-demo-x-label {
                        display: none;
                        font-size: 12px;
                        font-weight: 700;
                        letter-spacing: 1px;
                        margin-right: 4px;
                    }

                    .bbgl-expanded .bbgl-demo-x-label {
                        display: inline;
                    }

                    #bbgl-page-demo-exit {
                        color: #ab47bc !important;
                    }

                    #bbgl-page-demo-exit:hover {
                        color: #ce93d8 !important;
                        filter: drop-shadow(0 0 4px rgba(171, 71, 188, .3)) !important;
                    }

                    #bbgl-page-demo-exit .bbgl-demo-x-label {
                        display: inline !important;
                        font-size: 18px;
                    }

                    #bbgl-demo-exit-btn {
                        position: relative !important;
                        top: auto !important;
                        right: auto !important;
                    }

                    .bbgl-expanded #bbgl-demo-exit-btn {
                        width: auto !important;
                        padding: 0 4px;
                        gap: 4px;
                    }

                    #bbgl-content-wrapper {
                        flex: 1;
                        flex-shrink: 0;
                        background-color: #333;
                        border: .1px solid #444;
                        border-top: none;
                        border-radius: 0 0 5px 5px;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        position: relative;
                    }

                    #bbgl-top-panel {
                        box-sizing: border-box;
                        background-color: #2b2b2b;
                        box-shadow: inset 0 0 40px rgba(0, 0, 0, .95);
                        border-bottom: 1px solid #111;
                        position: relative;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                        padding-top: var(--bbgl-top-pt, 2px);
                        padding-bottom: 0px;
                        z-index: 25;
                    }

                    /* Taken out of flex flow so its height never displaces
                       #bbgl-bottom-panel/#bbgl-item-viewer below it - they read the same
                       --bbgl-top-h instead of flexing in response to this element. Page
                       mode is excluded: #bbgl-content-wrapper is display:contents there, so this
                       element flows as a direct flex child of #bbgl-panel via its own rule. */
                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-top-panel {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: var(--bbgl-top-h);
                        box-shadow: 0 5px 15px rgba(0, 0, 0, .5), inset 0 0 40px rgba(0, 0, 0, .95);
                        border-bottom: 1px solid #333;
                    }

                    /* #bbgl-item-viewer takes #bbgl-bottom-panel's slot while viewing an active
                       sticker item (see switchView()), so it needs the identical offset. Height
                       is forced to auto: #bbgl-item-viewer's base rule sets a fixed height:100%
                       for page mode's flex layout, which would make it ignore the bottom offset
                       here and overflow past the panel edge. */
                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-bottom-panel,
                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-item-viewer {
                        position: absolute;
                        top: var(--bbgl-top-h);
                        left: 0;
                        right: 0;
                        bottom: 0;
                        height: auto;
                    }

                    /* Dedicated box for the SVG toolbar row (view-switcher icons, item counters,
                       copy button). Every one of those was already position:absolute against
                       #bbgl-top-panel with hand-tuned coordinates, so this wrapper is deliberately
                       pinned to 0,0 at full width with no border and no padding: absolutely
                       positioned children resolve against a containing block's PADDING box, so
                       each icon's existing top/left/right - and #bbgl-item-counters' percentage
                       right - lands on exactly the same pixel it did as a direct child of the
                       panel. That is also why #bbgl-top-panel's mode-varying padding-top never
                       shifted these icons and still doesn't.

                       Two invariants this rule has to keep:
                       - top/left stay 0. measureToolbarCenter() (07-section-vi-ui.js) reads the
                         icons' offsetLeft/offsetTop, and their offsetParent is this element now
                         rather than #bbgl-top-panel. Any offset here silently drags the docked
                         achievements/stickerbook pagination clusters with it.
                       - z-index stays 60. The icons carried 59 and #bbgl-item-counters 60, and
                         nothing else in the panel stacks between the floating labels (50) and the
                         pagination clusters (61), so folding them into one stacking context at 60
                         reproduces the old paint order exactly.

                       No overflow, either: the active view's icon is scaled 1.15 with a drop-shadow
                       glow that reaches outside this box and must not be clipped.

                       pointer-events:none stops the band from swallowing clicks meant for whatever
                       sits under it - the graph HUD pills (z-index 40) run along this same row.
                       Every child re-enables its own.

                       The gradient bottoms out at fully transparent exactly at the box's own bottom
                       edge, so the toolbar reads as a shaded band with no hard border under it.
                       --bbgl-toolbar-shade is the single knob for how dark the top of that fade is. */
                    #bbgl-toolbar {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: var(--bbgl-toolbar-h, 20px);
                        z-index: 60;
                        pointer-events: none;
                        /* Laid out as a row with its two in-flow clusters pushed to opposite ends:
                           #bbgl-toolbar-icons on the left (which carries the graph's .g-mode pills
                           behind the icons in graph view), .g-stat on the right. space-between puts
                           the leftover width in the middle, which is why neither cluster needs its
                           width measured or its position tuned per mode, and this gap is the floor
                           on how close they can ever get. #bbgl-item-counters and #bbgl-copy-btn
                           stay absolutely positioned and sit outside this flow entirely; neither is
                           ever on screen at the same time as the pills (both are display:none in
                           graph view).

                           The left/right insets are margins on the children rather than padding
                           here, deliberately: padding would move the padding box that those two
                           absolutely positioned children resolve their right: offsets against. */
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: var(--bbgl-toolbar-min-gap, 12px);
                        background: linear-gradient(180deg,
                            rgba(0, 0, 0, var(--bbgl-toolbar-shade, .5)) 0%,
                            rgba(0, 0, 0, calc(var(--bbgl-toolbar-shade, .5) * .42)) 55%,
                            rgba(0, 0, 0, 0) 100%);
                    }

                    /* The four view-switcher icons: one left-justified row with an even gap. Their
                       horizontal placement is now two numbers - --bbgl-toolbar-pad and
                       --bbgl-toolbar-gap - in place of the twenty hand-tuned left values spread
                       across five rule sets that this replaced. flex:0 0 auto holds each icon at its
                       declared width instead of letting a narrow panel squeeze the row.

                       In #bbgl-toolbar's flex flow rather than positioned, so space-between can hold
                       it and .g-stat apart; the band's align-items:center puts it on the same
                       centreline every other child of the band sits on. In graph view this row also
                       carries .g-mode, which picks up the gap below and so trails the icons at the
                       same spacing they keep between themselves.

                       No z-index on purpose: leaving it auto keeps this from opening a stacking
                       context of its own, so the icons' z-index:59 still resolves inside
                       #bbgl-toolbar's context exactly as it did when they were its direct children. */
                    #bbgl-toolbar-icons {
                        /* Neither cluster shrinks. If they ever did outgrow the band together, a
                           shrinking row would spill its nowrap pills back over its neighbour; held
                           rigid, a flex overflow runs off the end instead and everything keeps its
                           position and its clearance. */
                        flex: 0 0 auto;
                        /* Spans the band's full height rather than shrinking to its tallest child,
                           so .g-hud-sep's percentage height is measured against the band. The row's
                           own align-items:center still puts the icons on the band's centreline. */
                        align-self: stretch;
                        margin-left: var(--bbgl-toolbar-pad, 8px);
                        display: flex;
                        align-items: center;
                        gap: var(--bbgl-toolbar-gap, 11px);
                    }

                    #bbgl-toolbar-icons > div {
                        flex: 0 0 auto;
                    }

                    /* #bbgl-copy-btn keeps the absolute centring the icons used to share with it: it
                       is right-anchored to the panel edge in every mode, not part of the left
                       cluster. Pinned to both edges with auto block margins, which is what centres an
                       absolutely positioned box of known height in its containing block - done this
                       way rather than top:50% + translateY(-50%) so it never collides with the
                       transform:scale(1.15) it carries in tall mode. */
                    #bbgl-copy-btn {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        margin-top: auto;
                        margin-bottom: auto;
                    }

                    /* Shared look for every toolbar control. Position deliberately isn't here any
                       more - see the two rules above. */
                    #bbgl-ledger-toggle,
                    #bbgl-graph-toggle,
                    #bbgl-achievements-toggle,
                    #bbgl-library-toggle,
                    #bbgl-sticker-toggle,
                    #bbgl-copy-btn {
                        color: rgba(255, 255, 255, .55);
                        cursor: pointer;
                        z-index: 60;
                        user-select: none;
                        transition: all .2s;
                        line-height: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    #bbgl-ledger-toggle:hover,
                    #bbgl-graph-toggle:hover,
                    #bbgl-achievements-toggle:hover,
                    #bbgl-library-toggle:hover,
                    #bbgl-sticker-toggle:hover,
                    #bbgl-copy-btn:hover {
                        color: rgba(255, 255, 255, 1);
                    }

                    #bbgl-ledger-toggle,
                    #bbgl-graph-toggle,
                    #bbgl-achievements-toggle,
                    #bbgl-library-toggle,
                    #bbgl-sticker-toggle,
                    #bbgl-copy-btn {
                        z-index: 59;
                        /* Visible unconditionally now. These used to start hidden and be revealed
                           by .bbgl-tall (plus an !important page-mode copy of the same thing); with
                           the short header gone there is no state left in which a toolbar icon is
                           hidden. pointer-events has to be re-stated here rather than left at the
                           default because #bbgl-toolbar is pointer-events:none. */
                        opacity: 1;
                        pointer-events: auto;
                        transition: opacity .3s cubic-bezier(.25, .8, .25, 1), color .15s, filter .15s, transform .15s;
                    }

                    #bbgl-ledger-toggle svg,
                    #bbgl-graph-toggle svg,
                    #bbgl-achievements-toggle svg,
                    #bbgl-library-toggle svg,
                    #bbgl-sticker-toggle svg,
                    #bbgl-copy-btn svg {
                        fill: currentColor;
                    }

                    #bbgl-graph-toggle,
                    #bbgl-graph-toggle svg,
                    #bbgl-library-toggle,
                    #bbgl-library-toggle svg,
                    #bbgl-sticker-toggle,
                    #bbgl-sticker-toggle svg {
                        width: 14px;
                        height: 14px;
                    }

                    #bbgl-ledger-toggle,
                    #bbgl-ledger-toggle svg,
                    #bbgl-achievements-toggle,
                    #bbgl-achievements-toggle svg,
                    #bbgl-copy-btn,
                    #bbgl-copy-btn svg {
                        width: 13.5px;
                        height: 13.5px;
                    }

                    .viewing-graph #bbgl-graph-toggle,
                    .viewing-achievements #bbgl-achievements-toggle,
                    .viewing-library #bbgl-library-toggle,
                    .viewing-stickers #bbgl-sticker-toggle,
                    [data-nav-target="ledger"] #bbgl-ledger-toggle,
                    [data-nav-target="graph"] #bbgl-graph-toggle,
                    [data-nav-target="achievements"] #bbgl-achievements-toggle,
                    [data-nav-target="stickers"] #bbgl-sticker-toggle {
                        color: #fff !important;
                        filter: drop-shadow(0 0 5px rgba(255, 255, 255, .7));
                        transform: scale(1.15);
                    }

                    /* data-nav-target is set while the top panel resizes out of the Library, before the
                       destination view's class is applied; the icon it names stays lit instead. */
                    #bbgl-top-panel:not(.viewing-graph):not(.viewing-stickers):not(.viewing-achievements):not(.viewing-library):not([data-nav-target]) #bbgl-ledger-toggle {
                        color: #fff !important;
                        filter: drop-shadow(0 0 5px rgba(255, 255, 255, .7));
                        transform: scale(1.15);
                    }

                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-copy-btn {
                        right: 8px;
                        transform: scale(1.15);
                    }

                    .bbgl-expanded #bbgl-ledger-toggle {
                        width: 15.5px;
                        height: 15.5px;
                    }

                    .bbgl-expanded #bbgl-graph-toggle {
                        width: 16px;
                        height: 15px;
                    }

                    .bbgl-expanded #bbgl-achievements-toggle {
                        width: 15.5px;
                        height: 15.5px;
                    }

                    .bbgl-expanded #bbgl-library-toggle,
                    .bbgl-expanded #bbgl-sticker-toggle {
                        width: 16px;
                        height: 15px;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-copy-btn {
                        width: 15.5px;
                        height: 15.5px;
                        right: 10px;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-ledger-toggle,
                    #bbgl-panel.bbgl-mode-page #bbgl-graph-toggle,
                    #bbgl-panel.bbgl-mode-page #bbgl-achievements-toggle,
                    #bbgl-panel.bbgl-mode-page #bbgl-library-toggle,
                    #bbgl-panel.bbgl-mode-page #bbgl-sticker-toggle,
                    #bbgl-panel.bbgl-mode-page #bbgl-copy-btn {
                        width: clamp(14.5px, calc(14.5px + 3.5px * var(--bbgl-page-t)), 18px);
                        height: clamp(14.5px, calc(14.5px + 3.5px * var(--bbgl-page-t)), 18px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-copy-btn {
                        right: 12px;
                    }

                    .bbgl-expanded #bbgl-ledger-toggle svg,
                    .bbgl-expanded #bbgl-graph-toggle svg,
                    .bbgl-expanded #bbgl-achievements-toggle svg,
                    .bbgl-expanded #bbgl-library-toggle svg,
                    .bbgl-expanded #bbgl-sticker-toggle svg,
                    .bbgl-expanded #bbgl-copy-btn svg,
                    .bbgl-mode-page #bbgl-ledger-toggle svg,
                    .bbgl-mode-page #bbgl-graph-toggle svg,
                    .bbgl-mode-page #bbgl-achievements-toggle svg,
                    .bbgl-mode-page #bbgl-library-toggle svg,
                    .bbgl-mode-page #bbgl-sticker-toggle svg,
                    .bbgl-mode-page #bbgl-copy-btn svg {
                        width: 100% !important;
                        height: 100% !important;
                    }

                    #bbgl-top-panel::after {
                        content: "";
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                        z-index: 10;
                        box-shadow: inset 1px 1px 1px rgba(255, 255, 255, .2), inset -1px -1px 2px rgba(0, 0, 0, .6);
                        background: radial-gradient(circle at center, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, .5) 100%), repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, .1) 2px, rgba(0, 0, 0, .1) 4px);
                    }

                    .glass-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-image: url('${ASSETS.GLASS_OVERLAY}');
                        background-size: 100% 100%;
                        background-position: center;
                        opacity: .5;
                        pointer-events: none;
                        mix-blend-mode: screen;
                        z-index: 11;
                        border-radius: inherit;
                    }

                    .ui-floating-label,
                    .ui-floating-summary {
                        position: absolute;
                        bottom: 3px;
                        font-size: 10px;
                        font-weight: 400;
                        pointer-events: none;
                        z-index: 50;
                    }

                    #bbgl-ledger-footer {
                        position: absolute;
                        right: 0;
                        bottom: 0;
                        left: 0;
                        height: var(--bbgl-toolbar-h);
                        padding: 0 8px var(--bbgl-ledger-footer-pb);
                        box-sizing: border-box;
                        display: flex;
                        align-items: flex-end;
                        justify-content: space-between;
                        gap: 8px;
                        pointer-events: none;
                        z-index: 50;
                    }

                    #bbgl-ledger-footer .ui-floating-label,
                    #bbgl-ledger-footer .ui-floating-summary {
                        position: static;
                        min-width: 0;
                        white-space: nowrap;
                    }

                    .ui-floating-label {
                        left: 8px;
                        color: rgba(255, 255, 255, .4);
                        letter-spacing: .5px;
                    }

                    .ui-floating-summary {
                        right: 8px;
                        color: rgba(255, 255, 255, .4);
                        letter-spacing: .3px;
                        text-align: right;
                    }

                    .bbgl-expanded .ui-floating-label,
                    .bbgl-expanded .ui-floating-summary {
                        bottom: 4px;
                    }

                    .viewing-graph .ui-floating-label,
                    .viewing-graph .ui-floating-summary,
                    .viewing-achievements .ui-floating-label,
                    .viewing-achievements .ui-floating-summary,
                    .viewing-library .ui-floating-label,
                    .viewing-library .ui-floating-summary {
                        opacity: 0;
                    }

                    .viewing-stickers .ui-floating-label,
                    .viewing-stickers .ui-floating-summary {
                        display: none;
                    }

                    #bbgl-top-panel.viewing-stickers {
                        box-shadow: none !important;
                        border-bottom: none !important;
                        background-color: transparent;
                        padding-bottom: 2px;
                    }

                    #bbgl-top-panel.viewing-stickers::after,
                    #bbgl-top-panel.viewing-stickers .glass-overlay {
                        display: none !important;
                    }

                    #bbgl-top-panel.viewing-achievements,
                    #bbgl-top-panel.viewing-library {
                        border-bottom: none !important;
                    }

                    #bbgl-top-panel.viewing-achievements::after,
                    #bbgl-top-panel.viewing-library::after {
                        box-shadow: inset 1px 1px 1px rgba(255, 255, 255, .2) !important;
                    }

                    .ledger-content {
                        position: relative;
                        flex: 1;
                        overflow-y: auto;
                        overflow-x: hidden;
                        padding: 0 2px 16px;
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 0;
                        transition: opacity .3s;
                        transform-origin: center;
                    }

                    .viewing-graph #bbgl-ledger-view,
                    .viewing-stickers #bbgl-ledger-view,
                    .viewing-achievements #bbgl-ledger-view,
                    .viewing-library #bbgl-ledger-view {
                        display: none !important;
                    }

                    .bbgl-expanded .ledger-content {
                        grid-template-columns: repeat(4, 1fr);
                        grid-template-rows: minmax(0, 1fr);
                        padding-bottom: 26px;
                    }

                    #bbgl-panel #bbgl-ledger-view {
                        position: absolute;
                        top: var(--bbgl-toolbar-h);
                        right: 0;
                        bottom: var(--bbgl-toolbar-h);
                        left: 0;
                        height: auto;
                        flex: none;
                        grid-template-rows: minmax(0, 1fr);
                        padding: 0 2px;
                        overflow: hidden;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-ledger-view {
                        padding: 0 4px !important;
                        overflow: hidden !important;
                        align-content: normal;
                    }

                    /* Achievements keeps its own flat top padding in tall mode (unlike the
                       ledger, which no longer needs a tall-specific override - see .stat-column).
                       Bumped up from a flat 3px to push content down into the vertical space
                       freed by the pagination dots moving into the toolbar row - compact gets a
                       smaller bump than expanded since it has less room to spare. */
                    #bbgl-panel.bbgl-expanded #bbgl-achievements-container {
                        --bbgl-ach-container-pt: 18px;
                    }

                    #bbgl-panel.bbgl-compact #bbgl-achievements-container {
                        --bbgl-ach-container-pt: 11px;
                    }

                    #bbgl-achievements-container {
                        padding-left: 8px;
                        padding-right: 8px;
                    }

                    /* Titles owns a three-track edge-to-edge layout; every other achievements page
                       keeps the small shared inset above. */
                    #bbgl-achievements-container.bbgl-ach-titles-page {
                        padding-left: 0;
                        padding-right: 0;
                    }

                    .stat-column {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        border-right: 1px solid rgba(255, 255, 255, .05);
                        padding: 0 2px;
                        min-height: 0;
                        --bbgl-f-top-mb: 0;
                        --bbgl-bot-minh: 0;
                    }

                    .stat-column:last-child {
                        border-right: none;
                    }

                    .stat-column .cell-stack {
                        gap: clamp(0px, 1px + .12cqb, 3px);
                    }

                    .stat-column .l-bot {
                        align-items: flex-start;
                    }

                    .col-header,
                    .col-data-block {
                        margin-bottom: 0;
                        flex-shrink: 0;
                        text-align: center;
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .bbgl-spacer {
                        flex: 1 1 var(--bbgl-col-gap);
                        max-height: var(--bbgl-col-gap);
                        min-height: 0;
                        width: 100%;
                    }

                    .cell-stack {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: flex-start;
                        line-height: 1.2;
                    }

                    .view-std {
                        display: inline;
                    }

                    .view-exp {
                        display: none;
                    }

                    .bbgl-expanded .view-std,
                    .bbgl-mode-page .view-std {
                        display: none;
                    }

                    .bbgl-expanded .view-exp,
                    .bbgl-mode-page .view-exp {
                        display: inline;
                    }

                    .bbgl-expanded .rates-group,
                    .bbgl-mode-page .rates-group {
                        margin-top: 2px;
                        margin-bottom: -2px;
                    }

                    @media (max-width: 375px) {
                        .ui-floating-label .view-exp,
                        .ui-floating-summary .view-exp {
                            display: none !important;
                        }

                        .ui-floating-label .view-std,
                        .ui-floating-summary .view-std {
                            display: inline !important;
                        }
                    }

                    @media (max-width: 450px) {
                        #bbgl-item-counters .bbgl-ic-dyn {
                            display: none !important;
                        }
                    }

                    .rate-pct {
                        display: none !important;
                    }

                    .bbgl-mode-page .rate-pct,
                    .bbgl-expanded .rate-pct {
                        display: inline !important;
                    }

                    .l-top {
                        font-size: var(--bbgl-f-top);
                        font-weight: 550;
                        color: #ddd;
                        margin-bottom: var(--bbgl-f-top-mb);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        white-space: nowrap;
                        letter-spacing: -.5px;
                    }

                    .l-bot {
                        font-size: var(--bbgl-f-bot);
                        color: #ddd;
                        min-height: var(--bbgl-bot-minh);
                        height: auto;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        white-space: nowrap;
                    }

                    .c-label {
                        font-weight: 700;
                        font-family: 'Arial', sans-serif;
                        font-size: var(--bbgl-f-label);
                        text-transform: var(--bbgl-label-case);
                        letter-spacing: 0;
                    }

                    .c-gain .l-top {
                        color: ${CONSTANTS.COLORS.GAINS};
                        font-weight: 550;
                    }

                    .c-gain .l-bot {
                        color: #bbb;
                        font-style: normal;
                    }

                    .c-total .l-top {
                        color: #fff;
                    }

                    .c-total .l-bot {
                        color: #bbb;
                    }

                    .t-str {
                        color: ${CONSTANTS.COLORS.STR};
                    }

                    .t-def {
                        color: ${CONSTANTS.COLORS.DEF};
                    }

                    .t-spd {
                        color: ${CONSTANTS.COLORS.SPD};
                    }

                    .t-dex {
                        color: ${CONSTANTS.COLORS.DEX};
                    }

                    .t-tot {
                        color: ${CONSTANTS.COLORS.TOT};
                    }

                    #bbgl-graph-container,
                    #bbgl-achievements-container,
                    #bbgl-library-container {
                        display: none;
                        flex: 1;
                        flex-direction: column;
                        position: relative;
                        z-index: 20;
                    }

                    .viewing-graph #bbgl-graph-container,
                    .viewing-achievements #bbgl-achievements-container,
                    .viewing-library #bbgl-library-container {
                        display: flex;
                    }

                    /* The Library takes the whole panel: #bbgl-top-panel grows over the calendar. Docked
                       modes already lay it absolutely over #bbgl-bottom-panel, so it just fills its
                       box. Page mode stacks them in flow, so it grows by the bottom panel's measured
                       height (--bbgl-lib-extra, set by resizeLibraryPanel()) and gives the same amount
                       back as a negative margin, which keeps the page from changing height. The
                       transition only exists while bbgl-lib-anim is on, so mode switches stay instant. */
                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-top-panel.viewing-library {
                        height: 100%;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-top-panel.viewing-library {
                        flex-basis: calc(clamp(180px, calc(180px + 90px * var(--bbgl-page-t)), 270px) + var(--bbgl-lib-extra, 0px));
                        height: calc(clamp(180px, calc(180px + 90px * var(--bbgl-page-t)), 270px) + var(--bbgl-lib-extra, 0px));
                        margin-bottom: calc(-1 * var(--bbgl-lib-extra, 0px));
                    }

                    /* The glass art is drawn for the normal top-panel height, so at full height it is
                       sliced instead of stretched: the top 85% and bottom 5% keep their normal-height
                       proportions and only the 85-95% band (side glare only) stretches to fill the
                       rest. Slice widths are fractions of the normal top-panel height; percentages in
                       --bbgl-top-h resolve against this box, which is that same full height here. */
                    #bbgl-top-panel.viewing-library .glass-overlay {
                        background-image: none;
                        border-style: solid;
                        border-width: 0;
                        border-image-source: url('${ASSETS.GLASS_OVERLAY}');
                        border-image-slice: 85% 0 5% 0 fill;
                        border-image-width: calc(var(--bbgl-top-h) * .85) 0 calc(var(--bbgl-top-h) * .05) 0;
                        border-image-repeat: stretch;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-top-panel.viewing-library .glass-overlay {
                        border-image-width: calc(clamp(180px, calc(180px + 90px * var(--bbgl-page-t)), 270px) * .85) 0 calc(clamp(180px, calc(180px + 90px * var(--bbgl-page-t)), 270px) * .05) 0;
                    }

                    #bbgl-panel.bbgl-lib-anim #bbgl-top-panel {
                        transition: height .36s cubic-bezier(.25, .8, .25, 1), flex-basis .36s cubic-bezier(.25, .8, .25, 1), margin-bottom .36s cubic-bezier(.25, .8, .25, 1);
                    }

                    /* While the Library grows or shrinks (during the view switch's blink, between CRT-out
                       and CRT-in), the views inside the top panel aren't rendered — every animated frame
                       would otherwise re-lay-out the Library's size container or the view it's returning
                       to. The panel's own chrome (toolbar, glass) stays. See resizeLibraryPanel(). */
                    #bbgl-panel.bbgl-lib-resizing #bbgl-top-panel > :not(#bbgl-toolbar):not(.glass-overlay) {
                        display: none !important;
                    }

                    /* The Library's space: everything under the toolbar band (the same top clearance
                       the graph uses), inset on the sides to clear the glass overlay's edge glare.
                       A size container, so row type scales with the page's height and 17 rows always
                       fit without scrolling. */
                    #bbgl-library-container {
                        min-height: 0;
                        overflow: hidden;
                        padding: calc(var(--bbgl-toolbar-h) - var(--bbgl-top-pt) + 4px) clamp(4px, 1.5%, 8px) 10px;
                        container-type: size;
                        container-name: bbgl-lib;
                        --bbgl-lib-font: 'Barlow Condensed', 'Arial Narrow', 'Nimbus Sans Narrow', Tahoma, sans-serif;
                    }

                    .bbgl-lib-list {
                        flex: 1;
                        min-height: 0;
                        display: flex;
                        flex-direction: column;
                        gap: clamp(3px, 1cqh, 8px);
                    }

                    /* One group: a faint rounded border around a spine (the group label, reading bottom to
                       top like a book spine) and the group's cards. Weighted by row count so rows stay equal
                       height across groups. */
                    .bbgl-lib-section {
                        flex: var(--bbgl-lib-panel-rows) 1 0;
                        min-height: 0;
                        display: flex;
                        gap: clamp(3px, 1cqw, 6px);
                        padding: clamp(2px, .6cqh, 4px);
                        border: 1px solid rgba(255, 255, 255, .08);
                        border-radius: 6px;
                    }

                    .bbgl-lib-group {
                        flex: 0 0 1.3em;
                        min-height: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                        border-right: 1px solid rgba(255, 255, 255, .08);
                        font-family: var(--bbgl-lib-font);
                        font-size: clamp(9.5px, min(2.2cqh, 2.78cqi), 13px);
                        font-weight: 600;
                        letter-spacing: .1em;
                        text-transform: uppercase;
                        color: rgba(255, 255, 255, .42);
                    }

                    .bbgl-lib-group-label {
                        writing-mode: vertical-rl;
                        transform: rotate(180deg);
                        white-space: nowrap;
                        line-height: 1;
                    }

                    /* One book, centred: its read date / active period on top, then title, effect beneath,
                       and its data. Every row (and every row of a .bbgl-lib-pairs grid) takes an equal
                       share of the page's height. */
                    .bbgl-lib-row {
                        flex: 1 1 0;
                        min-width: 0;
                        min-height: 0;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        /* The row's spare height is shared out evenly around its title/effect, data and
                           date instead of pooling above and below them; the gap is only the minimum. */
                        justify-content: space-evenly;
                        gap: clamp(0px, .35cqh, 3px);
                        /* Padding eats into the row's spare height before it's shared out, which shrinks the
                           gap between the title group and the stats while keeping both centred on the card.
                           The top also reserves the corner date's band (--bbgl-lib-date-h, 0 in compact,
                           which hides dates), so the title and stats centre in what's left under it. */
                        padding-block: calc(clamp(0px, .15cqh, 1px) + var(--bbgl-lib-date-h, 0px)) clamp(0px, .2cqh, 2px);
                        text-align: center;
                    }

                    .bbgl-lib-row:last-child,
                    .bbgl-lib-row:has(+ .bbgl-lib-group) {
                        border-bottom: none;
                    }

                    /* Entry separation, kept grayscale and quiet: every book is its own recessed card (the
                       weekly bar summary inset's etched look), with a small gap between cards in place of
                       divider lines. The group wrapper (.bbgl-lib-panel) is just layout: it spaces its
                       cards and takes a share of the page height by row count. Tune with
                       --bbgl-lib-card-bg / --bbgl-lib-card-gap. */
                    .bbgl-lib-list {
                        --bbgl-lib-date-h: calc(clamp(7.5px, 1.75cqh, 11px) * 1.1);
                        --bbgl-lib-card-bg: rgba(0, 0, 0, .18);
                        --bbgl-lib-card-raised-bg: rgba(255, 255, 255, .04);
                        --bbgl-lib-card-gap: clamp(2px, .6cqh, 5px);
                    }

                    .bbgl-lib-panel {
                        flex: 1 1 0;
                        min-width: 0;
                        min-height: 0;
                        display: flex;
                        flex-direction: column;
                        gap: var(--bbgl-lib-card-gap);
                    }

                    .bbgl-lib-panel > .bbgl-lib-grid {
                        flex: 1;
                    }

                    /* An unread book's card is a sunken recess; once it's been used the card sits proud of
                       the page instead — a slightly lighter face inside a hairline edge, with a soft, tight
                       shadow that keeps it seated on the background rather than floating above it. The
                       sunken/raised contrast is what marks a book as used; its text isn't dimmed. */
                    .bbgl-lib-row,
                    .bbgl-lib-item {
                        position: relative;
                        border-radius: 4px;
                        background: var(--bbgl-lib-card-bg);
                        box-shadow: inset 0 1px 2px rgba(0, 0, 0, .45), 0 1px 0 rgba(255, 255, 255, .04);
                    }

                    .bbgl-lib-row:not(.is-unread),
                    .bbgl-lib-item:not(.is-unread) {
                        background: var(--bbgl-lib-card-raised-bg);
                        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .05), inset 0 1px 0 rgba(255, 255, 255, .07), 0 1px 1px rgba(0, 0, 0, .3);
                    }

                    /* Single-stat books, two across. Grows by its row count so each of its rows matches
                       a full-width row's height. */
                    .bbgl-lib-pairs {
                        flex: var(--bbgl-lib-pair-rows) 1 0;
                        min-height: 0;
                        display: grid;
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        grid-template-rows: repeat(var(--bbgl-lib-pair-rows), minmax(0, 1fr));
                        gap: var(--bbgl-lib-card-gap);
                    }

                    .bbgl-lib-pairs:last-child,
                    .bbgl-lib-pairs:has(+ .bbgl-lib-group) {
                        border-bottom: none;
                    }

                    .bbgl-lib-pairs .bbgl-lib-row.is-last-row {
                        border-bottom: none;
                    }

                    .bbgl-lib-text {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: clamp(0px, .2cqh, 2px);
                        line-height: 1.1;
                        font-family: var(--bbgl-lib-font);
                    }

                    #bbgl-panel.bbgl-compact .bbgl-lib-text {
                        gap: 1px;
                    }

                    /* The date and the book's ✓ / In progress marker share the card's top-right corner, out
                       of the flow, so the title and effect centre on the card on their own. Compact keeps the
                       marker and drops the date. */
                    .bbgl-lib-stamp {
                        position: absolute;
                        top: clamp(1px, .4cqh, 4px);
                        right: clamp(3px, 1cqw, 8px);
                        max-width: calc(100% - var(--bbgl-lib-stamp-clear, .6em));
                        display: flex;
                        align-items: baseline;
                        min-width: 0;
                    }

                    .bbgl-lib-date {
                        min-width: 0;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-lib-list {
                        --bbgl-lib-date-h: clamp(6px, 1.5cqh, 9px);
                    }

                    #bbgl-panel.bbgl-compact .bbgl-lib-date {
                        display: none;
                    }

                    /* A book row's title centres on its text alone, with its ✓ / Reading marker hanging off
                       the end. Three columns: an empty spacer, the title, and the marker's column. The two
                       outer columns share the spare width equally, which centres the title, but the marker
                       column never goes narrower than the marker. So a short title is truly centred, and
                       a long one can use the whole row except the marker, sliding left rather than being
                       cut off early; the title text ellipsises only when even that isn't enough. */
                    .bbgl-lib-row .bbgl-lib-name {
                        width: 100%;
                        /* Optical nudge only: a transform moves the title without changing the layout. */
                        transform: translateY(1px);
                        display: grid;
                        grid-template-columns: minmax(0, 1fr) minmax(0, max-content) minmax(max-content, 1fr);
                        align-items: baseline;
                        overflow: visible;
                    }

                    .bbgl-lib-row .bbgl-lib-name::before {
                        content: '';
                    }

                    .bbgl-lib-title {
                        display: contents;
                    }

                    .bbgl-lib-title-text {
                        min-width: 0;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .bbgl-lib-title > .bbgl-lib-check,
                    .bbgl-lib-title > .bbgl-lib-reading {
                        justify-self: start;
                        white-space: nowrap;
                    }

                    /* Compact's larger title (up from 12px). The extra line height it adds
                       is taken back out of the space between the title/effect group and the stats, so the
                       row's top and bottom spacing stay as they were. */
                    #bbgl-panel.bbgl-compact .bbgl-lib-name {
                        font-size: clamp(9.5px, 2.6cqh, 14px);
                    }

                    #bbgl-panel.bbgl-compact .bbgl-lib-row > .bbgl-lib-data {
                        margin-top: calc((clamp(9.5px, 2.6cqh, 14px) - clamp(8px, 2.1cqh, 12px)) * -1.1);
                    }

                    /* Extra breathing room between the title/effect group and the stats, on top of the row's
                       even spacing. */
                    .bbgl-lib-row > .bbgl-lib-data {
                        margin-top: clamp(1px, .6cqh, 5px);
                    }

                    .bbgl-lib-data {
                        width: 100%;
                        min-width: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: var(--bbgl-lib-font);
                    }

                    /* The book's read date or active period, above its title. Both forms are in
                       the markup: compact shows the short date, expanded and page mode the exact timestamp. */
                    /* The size lives on the stamp so the ✓ / In progress marker matches its date exactly. */
                    .bbgl-lib-stamp {
                        font-family: var(--bbgl-lib-font);
                        font-size: clamp(7.5px, min(1.75cqh, 2.19cqi), 11px);
                        line-height: 1.1;
                    }

                    .bbgl-lib-date {
                        max-width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        letter-spacing: .03em;
                        color: rgba(255, 255, 255, .42);
                    }

                    .bbgl-lib-date .d-full,
                    #bbgl-panel.bbgl-compact .bbgl-lib-date .d-full {
                        display: none;
                    }

                    #bbgl-panel:not(.bbgl-compact) .bbgl-lib-date .d-full {
                        display: inline;
                    }

                    #bbgl-panel:not(.bbgl-compact) .bbgl-lib-date .d-short {
                        display: none;
                    }

                    .bbgl-lib-name,
                    .bbgl-lib-effect {
                        max-width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .bbgl-lib-name {
                        font-size: clamp(10px, min(2.8cqh, 2.92cqi), 15px);
                        font-weight: 600;
                        color: #e6e6e6;
                    }

                    /* The line height stays pinned to the effect's previous size (clamp(7px, 1.7cqh, 10px) × 1.1),
                       so the larger text doesn't move anything around it. */
                    .bbgl-lib-effect {
                        font-size: clamp(8px, min(1.9cqh, 2.34cqi), 11px);
                        line-height: calc(clamp(7.5px, min(1.7cqh, 2.19cqi), 10px) * 1.1);
                        /* overflow:hidden (for the ellipsis) clips at the padding box, so padding gives the
                           taller glyphs room to paint and the matching negative margin keeps the layout
                           exactly where it was. */
                        padding-block: 2px;
                        margin-block: -2px;
                        color: rgba(255, 255, 255, .55);
                    }

                    /* Book data cells: each number with its coloured stat label beside it, the group
                       centred in its row. Compact uses the abbreviated number and short label. */
                    .bbgl-lib-cells {
                        flex: 0 0 auto;
                        display: flex;
                        align-items: center;
                        gap: clamp(6px, 2.5cqw, 14px);
                        white-space: nowrap;
                    }

                    .bbgl-lib-cell {
                        display: flex;
                        flex-direction: row;
                        flex-wrap: wrap;
                        justify-content: center;
                        align-items: baseline;
                        column-gap: .3em;
                        line-height: 1.1;
                    }

                    /* Gym-gains books: the book's share of the gain, in parentheses on its own line under
                       the cell's number. Multi-stat strips drop the "from book" wording to fit their
                       narrower cells, and abbreviate alongside the numbers above (compact, or a strip that
                       didn't fit). */
                    .bbgl-lib-extra {
                        flex-basis: 100%;
                        text-align: center;
                        margin-top: 1px;
                        line-height: 1.1;
                        white-space: nowrap;
                        font-family: 'Inconsolata', monospace;
                        font-size: clamp(7.5px, min(1.75cqh, 2.19cqi), 11px);
                        font-weight: 500;
                        font-variant-numeric: tabular-nums;
                        color: rgba(255, 255, 255, .5);
                        pointer-events: none;
                    }

                    .bbgl-lib-extra .x-abbr,
                    .bbgl-lib-cells.is-multi .bbgl-lib-extra .x-word {
                        display: none;
                    }

                    .bbgl-lib-cells.is-tight .bbgl-lib-extra .x-full,
                    #bbgl-panel.bbgl-compact .bbgl-lib-extra .x-full {
                        display: none;
                    }

                    .bbgl-lib-cells.is-tight .bbgl-lib-extra .x-abbr,
                    #bbgl-panel.bbgl-compact .bbgl-lib-extra .x-abbr {
                        display: inline;
                    }

                    /* Multi-stat strips fill the row: every stat gets an equal share of the width, centred
                       in it, with a hairline divider between neighbours. .is-measure (fitLibraryCells())
                       briefly collapses the strip to its natural width to test whether it fits. */
                    .bbgl-lib-cells.is-multi {
                        width: 100%;
                        gap: 0;
                    }

                    /* Stand-ins for a book with no date or data yet: they hold the space so the title sits
                       where it will once the book is read. */
                    .bbgl-lib-cells.is-placeholder,
                    .bbgl-lib-date.is-placeholder {
                        visibility: hidden;
                    }

                    .bbgl-lib-cells.is-multi .bbgl-lib-cell {
                        flex: 1 1 0;
                        justify-content: center;
                        padding: 0 clamp(3px, 1.2cqw, 8px);
                    }

                    .bbgl-lib-cells.is-multi .bbgl-lib-cell + .bbgl-lib-cell {
                        border-left: 1px solid rgba(255, 255, 255, .12);
                    }

                    .bbgl-lib-cells.is-multi.is-measure {
                        width: auto;
                    }

                    .bbgl-lib-cells.is-multi.is-measure .bbgl-lib-cell {
                        flex: none;
                    }

                    /* Same number face as the achievements page's values (.ach-value). */
                    .bbgl-lib-val {
                        font-size: clamp(9.5px, min(2.2cqh, 2.78cqi), 13px);
                        font-family: 'Inconsolata', monospace;
                        font-weight: 500;
                        color: #eaeaea;
                        font-variant-numeric: tabular-nums;
                    }

                    .bbgl-lib-stat {
                        font-size: clamp(7.5px, min(1.6cqh, 2.19cqi), 10px);
                        font-weight: 600;
                    }

                    .bbgl-lib-cell.s-str .bbgl-lib-stat { color: ${CONSTANTS.COLORS.STR}; }
                    .bbgl-lib-cell.s-def .bbgl-lib-stat { color: ${CONSTANTS.COLORS.DEF}; }
                    .bbgl-lib-cell.s-spd .bbgl-lib-stat { color: ${CONSTANTS.COLORS.SPD}; }
                    .bbgl-lib-cell.s-dex .bbgl-lib-stat { color: ${CONSTANTS.COLORS.DEX}; }
                    .bbgl-lib-cell.s-tot .bbgl-lib-stat { color: ${CONSTANTS.COLORS.TOT}; }

                    .bbgl-lib-cell .v-abbr,
                    .bbgl-lib-cell .l-abbr {
                        display: none;
                    }

                    /* A multi-cell group that didn't fit (see fitLibraryCells()) abbreviates in place. */
                    .bbgl-lib-cells.is-tight .v-full,
                    .bbgl-lib-cells.is-tight .l-full {
                        display: none;
                    }

                    .bbgl-lib-cells.is-tight .v-abbr,
                    .bbgl-lib-cells.is-tight .l-abbr {
                        display: inline;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-lib-cell .v-full,
                    #bbgl-panel.bbgl-compact .bbgl-lib-cell .l-full {
                        display: none;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-lib-cell .v-abbr,
                    #bbgl-panel.bbgl-compact .bbgl-lib-cell .l-abbr {
                        display: inline;
                    }


                    /* Page 2: the non-training books as a plain checklist, two columns filled top to
                       bottom, every cell an equal share of the height. */
                    .bbgl-lib-grid {
                        flex: 1;
                        min-height: 0;
                        display: grid;
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        grid-template-rows: repeat(var(--bbgl-lib-rows), minmax(0, 1fr));
                        grid-auto-flow: column;
                        gap: var(--bbgl-lib-card-gap);
                    }

                    .bbgl-lib-item {
                        min-width: 0;
                        min-height: 0;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        line-height: 1.1;
                        font-family: var(--bbgl-lib-font);

                    }

                    /* Compact trims the Other Books checklist to titles; the training pages keep their
                       effects. An unread entry is the exception — with no date or data on it, its card has
                       the room (see the unread rules below). */
                    #bbgl-panel.bbgl-compact .bbgl-lib-item:not(.is-unread) .bbgl-lib-effect {
                        display: none;
                    }

                    .bbgl-lib-check {
                        margin-left: .35em;
                        font-size: 1em;
                        color: #69f0ae;
                        font-weight: 700;
                    }

                    /* Page mode's widest tier has room for larger Library type; each size keeps scaling
                       with the page's height, only the ceiling is raised. */
                    /* A book that has a whole row to itself has width to spare in the expanded panel, so its
                       type is sized by height alone — only the two-across grids (and the checklist pages)
                       need the width to pull their type down as the panel narrows. */
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-lib-panel > .bbgl-lib-row .bbgl-lib-name {
                        font-size: clamp(10px, 2.8cqh, 15px);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-lib-panel > .bbgl-lib-row .bbgl-lib-effect {
                        font-size: clamp(8px, 1.9cqh, 11px);
                        line-height: calc(clamp(7.5px, 1.7cqh, 10px) * 1.1);
                    }

                    /* Their numbers are the one thing that can still outgrow a full row, so they keep a width
                       term — but a gentle one: it only bites under ~420px and bottoms out at 11px. */
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-lib-panel > .bbgl-lib-row .bbgl-lib-val {
                        font-size: clamp(11px, min(2.2cqh, 3.1cqi), 13px);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-lib-panel > .bbgl-lib-row .bbgl-lib-stat {
                        font-size: clamp(7.5px, 1.6cqh, 10px);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-lib-panel > .bbgl-lib-row .bbgl-lib-extra {
                        font-size: clamp(8px, 1.9cqh, 11px);
                    }

                    /* The corner stamp gets the same gentle width term as the numbers: a full timestamp is
                       long, so it eases down from ~420px to 9px rather than holding its full size. */
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-lib-panel > .bbgl-lib-row .bbgl-lib-stamp {
                        font-size: clamp(9px, min(1.75cqh, 2.6cqi), 11px);
                    }

                    /* Cards with no numbers on them — every Other Books entry, and any book not yet read —
                       are a title and a short effect with room to spare, so their type is sized by height
                       alone and a title too wide for its card wraps instead of shrinking or ellipsising.
                       Descriptions stay on one line. Side padding keeps the wrapped title clear of the
                       card's edges. */
                    .bbgl-lib-item,
                    .bbgl-lib-row.is-unread {
                        padding-inline: clamp(4px, 2cqw, 10px);
                    }

                    /* Set by fitLibraryCells() only on an entry whose title wrapped AND that has a date: it
                       reserves the stamp's band so the wrapped title centres in what's left under it.
                       A one-line title stays centred on the whole card. */
                    .bbgl-lib-item.is-stamp-offset {
                        padding-top: var(--bbgl-lib-date-h, 0px);
                    }

                    .bbgl-lib-item .bbgl-lib-name,
                    .bbgl-lib-row.is-unread .bbgl-lib-name {
                        font-size: clamp(10px, 2.8cqh, 15px);
                        white-space: normal;
                        text-overflow: clip;
                    }

                    .bbgl-lib-item .bbgl-lib-effect,
                    .bbgl-lib-row.is-unread .bbgl-lib-effect {
                        font-size: clamp(8px, 1.9cqh, 11px);
                        line-height: calc(clamp(7.5px, 1.7cqh, 10px) * 1.1);
                    }

                    .bbgl-lib-item .bbgl-lib-stamp,
                    .bbgl-lib-row.is-unread .bbgl-lib-stamp {
                        font-size: clamp(8px, 1.9cqh, 11px);
                    }

                    /* An unread book row carries the same three placeholders a read one does — an invisible
                       date, no marker, and an invisible data cell the shape of the stats it will one day
                       show. With nothing to align to, they're dropped: the row loses the marker grid its
                       title hung off, the top padding that reserved the date's band, and both placeholders,
                       so the title stack centres on the card the way an Other Books entry does. */
                    .bbgl-lib-row.is-unread {
                        justify-content: center;
                        padding-block: clamp(0px, .15cqh, 1px);
                    }

                    .bbgl-lib-row.is-unread > .bbgl-lib-stamp,
                    .bbgl-lib-row.is-unread > .bbgl-lib-data {
                        display: none;
                    }

                    .bbgl-lib-row.is-unread .bbgl-lib-name {
                        display: block;
                        /* The optical nudge went with the marker grid. */
                        transform: none;
                    }

                    .bbgl-lib-row.is-unread .bbgl-lib-title-text {
                        white-space: normal;
                        overflow: visible;
                        text-overflow: clip;
                    }

                    /* Compact's panel is a fixed width, so an unread card there has no narrow tier to shrink
                       for — and with its date and data gone it has height to give back. Its description gets
                       it: shown on the Other Books page too, a size up from the one-line 11px ceiling, and
                       wrapped onto a second line rather than ellipsised. Cards with data keep the one-line
                       description, which is what holds their rows level with each other. */
                    #bbgl-panel.bbgl-compact .bbgl-lib-item.is-unread .bbgl-lib-effect,
                    #bbgl-panel.bbgl-compact .bbgl-lib-row.is-unread .bbgl-lib-effect {
                        font-size: clamp(9px, 2.2cqh, 13px);
                        line-height: 1.15;
                        white-space: normal;
                        text-overflow: clip;
                    }

                    @container bbgl-page (min-width:784px) {
                        #bbgl-panel.bbgl-mode-page .bbgl-lib-group {
                            font-size: clamp(8.5px, 2.1cqh, 16px);
                        }

                        #bbgl-panel.bbgl-mode-page .bbgl-lib-name {
                            font-size: clamp(9px, 3cqh, 20px);
                        }

                        #bbgl-panel.bbgl-mode-page .bbgl-lib-effect {
                            font-size: clamp(7.5px, 2.05cqh, 14px);
                            line-height: calc(clamp(7px, 1.85cqh, 13px) * 1.1);
                        }

                        #bbgl-panel.bbgl-mode-page .bbgl-lib-val {
                            font-size: clamp(8.5px, 2.4cqh, 17px);
                        }

                        #bbgl-panel.bbgl-mode-page .bbgl-lib-stat {
                            font-size: clamp(7px, 1.75cqh, 12.5px);
                        }

                        #bbgl-panel.bbgl-mode-page .bbgl-lib-stamp {
                            font-size: clamp(7.5px, 2.05cqh, 14px);
                        }

                        #bbgl-panel.bbgl-mode-page .bbgl-lib-list {
                            --bbgl-lib-date-h: calc(clamp(7.5px, 1.9cqh, 14px) * 1.1);
                        }
                    }

                    /* Read books and headers with a read book are click-to-copy. */
                    #bbgl-library-container [data-lib-copy] {
                        cursor: pointer;
                    }

                    /* A book still being read, or still inside its 31 days. */
                    .bbgl-lib-reading {
                        margin-left: .5em;
                        flex: none;
                        white-space: nowrap;
                        font-size: .6em;
                        font-weight: 600;
                        letter-spacing: .06em;
                        text-transform: uppercase;
                        color: #8fd3ff;
                    }

                    /* Memories And Mammaries' row and the book it repeated are marked with a repeat symbol in
                       the top left corner instead of a tint, so their cards match every other book's. */
                    /* These carry the repeat icon in the opposite corner, so their stamp stops short of it. */
                    .bbgl-lib-row.is-repeat,
                    .bbgl-lib-row.is-repeated,
                    .bbgl-lib-item.is-repeat,
                    .bbgl-lib-item.is-repeated {
                        position: relative;
                        --bbgl-lib-stamp-clear: 2.4em;
                    }

                    .bbgl-lib-row.is-repeat::after,
                    .bbgl-lib-row.is-repeated::after,
                    .bbgl-lib-item.is-repeat::after,
                    .bbgl-lib-item.is-repeated::after {
                        content: '';
                        position: absolute;
                        top: clamp(1px, .4cqh, 4px);
                        left: clamp(2px, .8cqw, 6px);
                        width: clamp(10px, 2.6cqh, 16px);
                        height: clamp(10px, 2.6cqh, 16px);
                        opacity: .75;
                        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23ce93d8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M13.5 8a5.5 5.5 0 1 1-1.9-4.2'/%3E%3Cpath d='M13.6 1.6v2.8h-2.8'/%3E%3C/svg%3E") center / contain no-repeat;
                        pointer-events: none;
                    }

                    .bbgl-lib-data-inner {
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        min-width: 0;
                    }

                    /* Values that may be incomplete or imprecise read slightly dimmer; the tooltip says why. */
                    .bbgl-lib-data-inner.is-approx .bbgl-lib-val {
                        opacity: .7;
                    }

                    .viewing-graph #bbgl-graph-container {
                        padding: calc(var(--bbgl-toolbar-h) - var(--bbgl-top-pt) + 4px) calc(var(--bbgl-toolbar-pad) + 2px) 12px var(--bbgl-toolbar-pad);
                        z-index: 40;
                        transform-origin: center;
                        touch-action: none;
                        cursor: crosshair;
                        min-height: 0;
                        overflow: hidden;
                    }

                    .viewing-achievements #bbgl-achievements-container.ledger-content {
                        grid-template-columns: unset;
                        grid-template-rows: unset !important;
                        gap: 0;
                        min-height: 0 !important;
                        overflow: hidden !important;
                        display: flex !important;
                        flex-direction: column !important;
                        flex: 1 !important;
                        /* This container wears .ledger-content for the shared chrome, but it is not a
                           ledger, so it opts out of that class's own bottom padding (16px base / 26px
                           expanded) and sets its own here. This padding is what positions the rank bar
                           off the panel's bottom border: .bbgl-titles-page fills this container's full
                           box exactly (see that rule's own comment), so the bar rides this container's
                           bottom edge and this value IS the bar's gap to the border. */
                        padding-bottom: 2px !important;
                    }

                    /* The graph's mode/stat pills. They live in #bbgl-toolbar now rather than at the
                       top of #bbgl-graph-container, which is what lets the graph body use its full
                       height (see GraphController.draw(), which no longer subtracts a HUD height).

                       The two groups sit at opposite ends of the band. .g-mode is a member of
                       #bbgl-toolbar-icons, so it inherits that row's own gap and trails the
                       view-switcher icons at exactly the spacing the icons keep between themselves;
                       .g-stat is the band's right-hand flex child. Whatever width is left over is
                       absorbed by the space-between gap in the middle, so nothing here depends on
                       the pills measuring to any particular width in any mode.

                       Both are hidden outside graph view - the only view-specific children of the
                       band. pointer-events is restated because the band is pointer-events:none. */
                    .g-toggles.g-mode,
                    .g-toggles.g-stat {
                        display: none;
                        flex: 0 0 auto;
                        pointer-events: auto;
                    }

                    .g-toggles.g-stat {
                        margin-right: var(--bbgl-toolbar-pad, 8px);
                    }

                    #bbgl-top-panel.viewing-graph .g-toggles.g-mode,
                    #bbgl-top-panel.viewing-graph .g-toggles.g-stat {
                        display: flex;
                    }

                    /* Hairline marking where the view switcher ends and the graph's own controls
                       begin - the one place in the band where two kinds of control sit side by side
                       at the same spacing. Deliberately short of the band's full height so it reads
                       as a separator rather than a second border under the header. */
                    .g-hud-sep {
                        display: none;
                        flex: 0 0 auto;
                        width: 1px;
                        height: 62%;
                        background: rgba(255, 255, 255, .22);
                        border-radius: 1px;
                    }

                    #bbgl-top-panel.viewing-graph .g-hud-sep {
                        display: block;
                    }

                    /* The smallest page tier's graph band ran 16px short once the Library icon joined
                       the row. The inset and icon gap tighten for every view, not just graph, so the
                       icon row sits in the same place whichever page is open. Declared on the band
                       itself so the content padding that also reads --bbgl-toolbar-pad is untouched. */
                    @container bbgl-page (max-width:385px) {
                        #bbgl-panel.bbgl-mode-page #bbgl-toolbar {
                            --bbgl-toolbar-pad: 8px;
                            --bbgl-toolbar-gap: 8px;
                        }

                        /* Clearance before the stat pills only exists in graph view. */
                        #bbgl-panel.bbgl-mode-page #bbgl-top-panel.viewing-graph #bbgl-toolbar {
                            --bbgl-toolbar-min-gap: 6px;
                        }
                    }

                    .g-toggles {
                        display: flex;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        gap: 2px;
                        align-items: center;
                        min-width: 0;
                        flex: 0 1 auto;
                    }

                    .g-pill {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 8.5px;
                        padding: .5px 5px;
                        border: 1px solid #444;
                        border-radius: 3px;
                        color: #666;
                        cursor: pointer;
                        text-transform: uppercase;
                        font-weight: 700;
                        align-self: center;
                        background: #1a1a1a;
                        transition: color .2s, background .2s, border-color .2s;
                        user-select: none;
                        white-space: nowrap;
                        line-height: 1;
                        vertical-align: middle;
                    }

                    .g-pill:hover {
                        color: #ccc;
                        border-color: #666;
                    }

                    .g-pill.active {
                        color: var(--pill-c, #fff);
                        background: var(--pill-bg, #333);
                        border-color: var(--pill-c, #888);
                    }

                    .g-pill.p-str {
                        --pill-c: ${CONSTANTS.COLORS.STR};
                        --pill-bg: rgba(50, 100, 198, .1);
                    }

                    .g-pill.p-def {
                        --pill-c: ${CONSTANTS.COLORS.DEF};
                        --pill-bg: rgba(220, 57, 18, .1);
                    }

                    .g-pill.p-spd {
                        --pill-c: ${CONSTANTS.COLORS.SPD};
                        --pill-bg: rgba(255, 153, 0, .1);
                    }

                    .g-pill.p-dex {
                        --pill-c: ${CONSTANTS.COLORS.DEX};
                        --pill-bg: rgba(16, 150, 24, .1);
                    }

                    .g-pill.p-tot {
                        --pill-c: ${CONSTANTS.COLORS.TOT};
                        --pill-bg: rgba(255, 255, 255, .1);
                    }

                    /* Smaller than in the other modes: compact is the tightest width the pills have
                       to live at, sharing 300px with the icon row and the divider. Measured, the two
                       groups come to 152.7px against a budget of 161px - what is left of the band
                       once the end insets, the icons, the divider with its two gaps and the minimum
                       centre gap are taken out. */
                    #bbgl-panel.bbgl-compact .g-toggles {
                        gap: 1px;
                    }

                    #bbgl-panel.bbgl-compact .g-pill {
                        font-size: 7px;
                        padding: 1.5px;
                        line-height: 1;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        box-sizing: border-box;
                    }

                    #bbgl-graph-svg {
                        width: 100%;
                        flex: 1;
                        min-height: 0;
                        overflow: visible;
                        pointer-events: none;
                        display: block;
                    }

                    .g-axis {
                        stroke: rgba(255, 255, 255, .1);
                        stroke-width: 1;
                    }

                    .g-path {
                        fill: none;
                        stroke-width: 2;
                        vector-effect: non-scaling-stroke;
                        stroke-linecap: round;
                        transition: d .3s ease;
                    }

                    .g-text {
                        fill: rgba(255, 255, 255, .4);
                        font-size: 9px;
                        font-family: 'Roboto Mono', monospace;
                        user-select: none;
                    }

                    .g-text.x-label {
                        text-anchor: middle;
                        font-family: 'Fjalla One', sans-serif;
                        font-size: 11px;
                        letter-spacing: .5px;
                    }

                    #bbgl-panel.bbgl-compact .g-text.x-label {
                        font-size: 10px;
                    }

                    /* The zero label is the one that reads better tucked against its gridline than
                       lined up with the rest of the column - see the y-label block in
                       08-section-vii-graph.js, which pairs this with an x of -3. */
                    .g-text.y-label.y-label-zero {
                        text-anchor: end;
                    }

                    .g-text.y-label {
                        text-anchor: start;
                        font-family: 'Barlow Condensed', 'Arial Narrow', 'Nimbus Sans Narrow', Tahoma, sans-serif;
                        font-weight: 500;
                        letter-spacing: .005em;
                    }

                    /* No opacity transition on purpose: each 0.1s fade was an animation starting on an
                       SVG shape, which Chrome layerizes — and everything the graph draws after that
                       point (the later series' lines and points) got regrouped and repainted on every
                       step of a scrub. The dot now simply shows/hides with .active. */
                    .g-point-group .g-point-visual {
                        opacity: 0;
                        stroke-width: 1.5;
                        pointer-events: none;
                    }

                    .g-point-group.active .g-point-visual {
                        opacity: 1;
                    }

                    #bbgl-sticker-bg {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-image: url('${ASSETS.STICKER_BG}');
                        background-size: cover;
                        background-position: center;
                        z-index: 5;
                        opacity: 0;
                        transition: opacity .3s;
                        pointer-events: none;
                    }

                    .viewing-stickers #bbgl-sticker-bg {
                        opacity: .9;
                    }

                    #bbgl-sticker-container {
                        display: none;
                        flex: 1;
                        flex-direction: column;
                        position: relative;
                        /* --bbgl-sticker-arrow-w is the nav-arrow width; the arrows are absolute at left:0 /
                           right:0, so using it as this container L/R padding lands the grid edge exactly at
                           each arrow inner face. Declared here and inherited by the .sticker-nav-btn width
                           below, so the padding and the arrow it clears can never drift apart. Per-mode
                           values are set on this same element in the page/expanded overrides. */
                        --bbgl-sticker-arrow-w: 20px;
                        /* --bbgl-sticker-title-clear reserves room for #bbgl-sticker-title (bottom-left, this
                           mode's value = that title box's own height plus its own bottom offset, since the title
                           itself is position:absolute and would otherwise take no flow space here). With that
                           reserved as real padding and justify-content:centre below, the grid centres in the
                           band between the toolbar (top padding) and the title (bottom padding) rather than
                           filling the whole box underneath the toolbar down to the title. */
                        --bbgl-sticker-title-clear: 22px;
                        padding: 4px var(--bbgl-sticker-arrow-w) var(--bbgl-sticker-title-clear);
                        z-index: 40;
                        transform-origin: center;
                        overflow: hidden;
                        justify-content: center;
                    }

                    .sticker-nav-btn {
                        position: absolute;
                        /* Centred on the gap between the two sticker rows, not the panel. The grid is
                           centred (justify-content) in the container's content box and its two rows are
                           equal, so the row gap sits at that box's middle. Pinning top/bottom to the
                           container's padding (4px top, --bbgl-sticker-title-clear bottom) and letting
                           margin auto centre the button lands it exactly there in every docked width;
                           page mode's container has no vertical padding and pins to 0/0 instead. */
                        top: 4px;
                        bottom: var(--bbgl-sticker-title-clear);
                        margin: auto 0;
                        width: var(--bbgl-sticker-arrow-w);
                        height: 25px;
                        background: 0 0;
                        color: #fff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        z-index: 90;
                        font-size: 24px;
                        font-weight: 700;
                        opacity: .82;
                        mix-blend-mode: soft-light;
                        transition: transform .18s, opacity .18s, color .18s;
                        user-select: none;
                        line-height: 1;
                        text-shadow: none;
                    }

                    @media (hover: hover) {
                        .sticker-nav-btn:hover {
                            color: #fff;
                            opacity: .98;
                            transform: scale(1.12);
                            text-shadow: none;
                            filter: none;
                        }
                    }

                    .sticker-nav-btn:active {
                        color: #fff;
                        opacity: 1;
                        transform: scale(1.16);
                        text-shadow: none;
                        filter: none;
                    }

                    .sticker-nav-btn.disabled {
                        opacity: 0;
                        pointer-events: none;
                    }

                    #sticker-prev-btn {
                        left: 0;
                        border-radius: 0 5px 5px 0;
                    }

                    #sticker-next-btn {
                        right: 0;
                        border-radius: 5px 0 0 5px;
                    }

                    .viewing-stickers #bbgl-sticker-container {
                        display: flex;
                    }

                    #bbgl-sticker-grid {
                        position: relative;
                        display: grid;
                        /* auto (not 1fr) columns so each column shrinks to its sticker instead of being a
                           wide fifth of the row with a portrait image floating in the middle - that dead
                           side space used to read as box padding and no column-gap could remove it.
                           justify-content space-between then distributes the five columns across the
                           container inside-of-arrow-to-inside-of-arrow width (see #bbgl-sticker-container
                           padding = --bbgl-sticker-arrow-w): first/last column sit flush with the padding
                           edges, the rest space out evenly between them, instead of clustering centre with
                           the leftover width pushed to the outside. */
                        grid-template-columns: repeat(5, auto);
                        grid-template-rows: auto auto;
                        justify-content: space-between;
                        width: 100%;
                        row-gap: 0;
                    }

                    .sticker-slot {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        overflow: visible;
                        padding: 0;
                        /* Compact-tall stickerbook. Paired with .sticker-img height:88.5% below: the image
                           is a % of this height, so the two move together to keep the rendered sticker ~51px
                           (58 * .885) while the leftover vertical whitespace between the two grid rows stays
                           small. Change one without the other and the sticker resizes. */
                        height: 58px;
                        visibility: hidden;
                    }

                    .sticker-slot.active-slot {
                        visibility: visible;
                    }

                    #bbgl-panel.bbgl-mode-page .sticker-slot {
                        height: min(
                            clamp(65px, calc(65px + 40px * var(--bbgl-page-t)), 105px),
                            calc((100cqb - var(--bbgl-sticker-row-gap)) / 2)
                        );
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-sticker-grid {
                        row-gap: var(--bbgl-sticker-row-gap);
                    }

                    .sticker-slot.has-item:hover {
                        cursor: pointer;
                        z-index: 45;
                    }

                    .sticker-img {
                        height: 88.5%; /* of .sticker-slot height 58px - see the note there */
                        width: auto;
                        max-width: 140%;
                        object-fit: contain;
                        pointer-events: none;
                        user-select: none;
                        -webkit-user-drag: none;
                        transition: transform .2s, filter 0s;
                        filter: drop-shadow(0 -.5px 0 rgba(0, 0, 0, .3)) drop-shadow(0 .5px 0 rgba(255, 255, 255, .4));
                    }

                    .sticker-slot.locked .sticker-img {
                        filter: brightness(0) invert(1) drop-shadow(0 -.5px 0 rgba(0, 0, 0, .2)) drop-shadow(0 .5px 0 rgba(255, 255, 255, .2));
                        opacity: .9;
                    }

                    .bbgl-expanded .sticker-img,
                    .bbgl-mode-page .sticker-img {
                        height: 100%;
                        max-width: 100%;
                    }

                    .bbgl-expanded .sticker-slot.locked .sticker-img,
                    .bbgl-mode-page .sticker-slot.locked .sticker-img {
                        height: 90%;
                        width: 100%;
                    }

                    /* The dots+arrows cluster here reuses the achievements pagination's own
                       treatment wholesale — same classes (.pg-dot, .bbgl-ach-nav) and the same
                       ID-scoped sizing/hover/active rules (#bbgl-ach-pageindicator .pg-dot etc.,
                       further down this file) extended to also match #bbgl-sticker-pagination, so
                       there's one set of rules to keep in sync rather than two copies. This wrapper
                       carries the same custom-property values #bbgl-ach-footer defines (--bbgl-ach-
                       dot-gap/-dot-w/-nav-size/-nav-py/-nav-px) since those rules read var()s that
                       only resolve if something in the ancestor chain actually sets them —
                       #bbgl-sticker-pagination-bar isn't a descendant of #bbgl-ach-footer, so it
                       needs its own copies of the same values.

                       Position is ALSO JS-driven now, same mechanism as #bbgl-ach-footer
                       (--bbgl-ach-dot-x/-y, layoutToolbarPaginationPosition() in
                       07-section-vi-ui.js) rather than a fixed top/full-width-centre guess.

                       This element is a direct child of #bbgl-top-panel now — a sibling of the
                       toolbar icons and of #bbgl-sticker-container, NOT nested inside the container
                       — for the same reason #bbgl-ach-footer is a sibling of
                       #bbgl-achievements-container rather than nested inside it: the icons'
                       Y-position is only in the same coordinate space as this element's offsetParent
                       when that offsetParent IS #bbgl-top-panel. Nested one level deeper inside the
                       container (which itself starts below the icon row), the JS's "icon centre
                       relative to my own parent" math correctly came out negative — the icons ARE
                       above where the container starts — which pushed this whole bar above the
                       container's top edge and off-screen. Being a top-panel-level sibling makes the
                       coordinate math trivially correct instead of needing a correction for it.

                       Because it's no longer nested inside #bbgl-sticker-container, it no longer
                       inherits that container's .viewing-stickers show/hide for free — see the
                       display:none default here and the .viewing-stickers override below, mirroring
                       #bbgl-top-panel.viewing-achievements #bbgl-ach-footer further down this file.

                       The stickerbook's original big edge arrows (.sticker-nav-btn) are unrelated,
                       stayed inside #bbgl-sticker-container, and are untouched by any of this. */
                    #bbgl-sticker-pagination-bar,
                    #bbgl-lib-pagination-bar {
                        --bbgl-ach-dot-gap: 8px;
                        --bbgl-ach-dot-w: 8px;
                        --bbgl-ach-nav-size: clamp(7px, calc(1.3 * var(--bbgl-ach-dot-w)), 11px);
                        --bbgl-ach-nav-py: 4px;
                        --bbgl-ach-nav-px: clamp(4px, calc(4px + 8px * var(--bbgl-dock-t, 0)), 12px);
                        position: absolute;
                        top: var(--bbgl-ach-dot-y, 12px);
                        left: var(--bbgl-ach-dot-x, 50%);
                        transform: translate(-50%, -50%);
                        display: none;
                        align-items: center;
                        gap: var(--bbgl-ach-dot-gap);
                        min-height: 12px;
                        z-index: 61;
                    }

                    #bbgl-top-panel.viewing-stickers #bbgl-sticker-pagination-bar,
                    #bbgl-top-panel.viewing-library #bbgl-lib-pagination-bar {
                        display: flex;
                    }

                    #bbgl-sticker-pagination,
                    #bbgl-lib-pagination {
                        display: flex;
                        align-items: center;
                        gap: var(--bbgl-ach-dot-gap);
                    }

                    .pg-dot {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, .25);
                        cursor: pointer;
                        transition: all .2s;
                    }

                    .pg-dot.active {
                        background: #fff;
                        transform: scale(1.2);
                        box-shadow: 0 0 5px rgba(255, 255, 255, .5);
                    }

                    /* Centred panel-level printer's mark for the active stickerbook page. */
                    #bbgl-sticker-title {
                        display: none;
                        position: absolute;
                        bottom: 8px;
                        left: 50%;
                        transform: translateX(-50%);
                        font-size: 12px;
                        color: #164e4c;
                        font-family: 'Fjalla One', sans-serif;
                        font-weight: 400;
                        letter-spacing: .65px;
                        line-height: 1;
                        z-index: 99;
                        pointer-events: none;
                        mix-blend-mode: multiply;
                        opacity: .8;
                        text-transform: uppercase;
                        text-align: center;
                        white-space: nowrap;
                        align-items: center;
                        gap: 6px;
                    }

                    .viewing-stickers #bbgl-sticker-title {
                        display: flex;
                    }

                    /* Dots and hairlines frame the page name as a compact printer's mark. */
                    #bbgl-sticker-title::before,
                    #bbgl-sticker-title::after {
                        content: '';
                        display: block;
                        width: clamp(16px, 5vw, 28px);
                        height: 3px;
                        flex: 0 0 auto;
                        opacity: .58;
                        background:
                            radial-gradient(circle, currentColor 0 1.25px, transparent 1.45px) left center / 3px 3px no-repeat,
                            linear-gradient(currentColor, currentColor) 5px center / calc(100% - 5px) 1px no-repeat;
                    }

                    #bbgl-sticker-title::after {
                        transform: scaleX(-1);
                    }

                    .bbgl-expanded #bbgl-sticker-title {
                        font-size: clamp(13px, calc(13px + 2px * var(--bbgl-dock-t, 0)), 15px);
                        bottom: 10px;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-sticker-title {
                        font-size: clamp(12px, calc(12px + 8px * var(--bbgl-page-t)), 20px);
                        left: 0;
                        right: 0;
                        bottom: 0;
                        height: var(--bbgl-sticker-footer-h);
                        padding-bottom: clamp(8px, calc(8px + 2px * var(--bbgl-page-t)), 10px);
                        box-sizing: border-box;
                        justify-content: center;
                        transform: none;
                    }

                    .copy-hist-btn {
                        position: absolute;
                        right: 5px;
                        width: 14.5px;
                        height: 14.5px;
                        cursor: pointer;
                        z-index: 90;
                        transition: all .2s;
                        user-select: none;
                        opacity: .6;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .copy-hist-btn svg {
                        width: 100% !important;
                        height: 100% !important;
                        margin: 0 !important;
                        transition: all .2s;
                    }

                    .copy-hist-btn:hover {
                        opacity: 1;
                        transform: scale(1.27);
                        filter: drop-shadow(0 0 5px rgba(255, 255, 255, .4));
                    }

                    .viewing-stickers .copy-hist-btn {
                        display: none !important;
                    }

                    /* Copy session + item counters are ledger-only: hide on every non-ledger view. */
                    .viewing-graph .copy-hist-btn,
                    .viewing-achievements .copy-hist-btn,
                    .viewing-library .copy-hist-btn {
                        display: none !important;
                    }

                    #bbgl-item-counters {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        margin-top: auto;
                        margin-bottom: auto;
                        right: 10%;
                        display: flex;
                        gap: 10px;
                        align-items: center;
                        z-index: 60;
                        white-space: nowrap;
                        font-size: 10px;
                        font-weight: 500;
                        color: #bbb;
                        font-family: 'Barlow Condensed', 'Arial Narrow', 'Nimbus Sans Narrow', Tahoma, sans-serif;
                        font-variant-numeric: tabular-nums;
                        height: 14px;
                        pointer-events: auto;
                    }

                    .viewing-graph #bbgl-item-counters,
                    .viewing-achievements #bbgl-item-counters,
                    .viewing-library #bbgl-item-counters,
                    .viewing-stickers #bbgl-item-counters {
                        display: none !important;
                    }

                    .bbgl-expanded #bbgl-item-counters {
                        font-size: clamp(11px, calc(11px + 1px * var(--bbgl-dock-t)), 12px);
                        right: 38px;
                        gap: clamp(4px, calc(4px + 10px * var(--bbgl-dock-t)), 14px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-item-counters {
                        font-size: clamp(8.5px, calc(8.5px + 5.5px * var(--bbgl-page-t)), 14px);
                        gap: clamp(4px, calc(4px + 10px * var(--bbgl-page-t)), 14px);
                        right: clamp(38px, calc(38px + 4px * var(--bbgl-page-t)), 42px);
                        height: clamp(16px, calc(16px + 2px * var(--bbgl-page-t)), 18px);
                    }

                    #bbgl-item-counters .bbgl-ic {
                        display: inline-flex;
                        align-items: baseline;
                        gap: 3px;
                    }

                    #bbgl-item-counters .bbgl-ic-dyn {
                        display: none;
                    }

                    .bbgl-expanded #bbgl-item-counters .bbgl-ic-dyn,
                    #bbgl-panel.bbgl-mode-page #bbgl-item-counters .bbgl-ic-dyn {
                        display: inline-flex;
                    }

                    #bbgl-item-counters .bbgl-ic-yes {
                        color: #43a047;
                        font-weight: 700;
                    }

                    #bbgl-item-counters .bbgl-ic-no {
                        color: #e53935;
                        font-weight: 700;
                    }

                    #bbgl-item-counters .bbgl-ic-sub {
                        font-size: .82em;
                        opacity: .6;
                        font-weight: 500;
                    }

                    #bbgl-panel.bbgl-mode-page .copy-hist-btn {
                        width: clamp(16px, calc(16px + 2px * var(--bbgl-page-t)), 18px);
                        height: clamp(16px, calc(16px + 2px * var(--bbgl-page-t)), 18px);
                    }

                    /* Tops unchanged; the floors drop to expanded's (see that block for how the
                       6.75px/2.75px pair is derived), and the raw width ratio gives way to the staged
                       curves — the pill's own type and padding onto -pills so they hold full size
                       until the band's whitespace is gone, the inter-pill gap onto -gaps so it is
                       part of that whitespace (see "Staged width curves").

                       The old floors were never budgeted against the narrow end the way expanded's
                       were: 8.8px/3px/4px here against 6.25px/1.5px/1px there, on a band that also
                       carries a wider pad and min-gap. Both clusters are flex:0 0 auto by design
                       (see #bbgl-toolbar-icons), so overrunning the band does not compress them —
                       it overflows, and the panel's overflow-x:hidden cuts the pills off. */
                    #bbgl-panel.bbgl-mode-page .g-pill {
                        font-size: clamp(6.75px, calc(6.75px + 3.25px * var(--bbgl-t-type)), 10px);
                        padding: 1.5px clamp(2.75px, calc(2.75px + 5.25px * var(--bbgl-t-pad)), 8px);
                        line-height: calc(1.18 + .26 * (1 - var(--bbgl-t-type)));
                    }

                    #bbgl-panel.bbgl-mode-page .g-toggles {
                        gap: clamp(1px, calc(1px + 5px * var(--bbgl-t-gaps)), 6px);
                        align-items: center;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-graph-container .g-text {
                        font-size: clamp(10px, calc(10px + 1px * var(--bbgl-page-t)), 11px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-graph-container .g-text.x-label {
                        font-size: clamp(8px, calc(8px + 2px * var(--bbgl-page-t)), 10px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-sticker-pagination-bar,
                    #bbgl-panel.bbgl-mode-page #bbgl-lib-pagination-bar {
                        --bbgl-ach-dot-gap: clamp(5px, calc(5px + 3px * var(--bbgl-page-t)), 8px);
                        --bbgl-ach-dot-w: clamp(6px, calc(6px + 2px * var(--bbgl-page-t)), 8px);
                        --bbgl-ach-nav-size: clamp(7px, calc(1.3 * var(--bbgl-ach-dot-w)), 11px);
                        --bbgl-ach-nav-py: clamp(3px, calc(3px + 1px * var(--bbgl-page-t)), 4px);
                        --bbgl-ach-nav-px: clamp(4px, calc(4px + 4px * var(--bbgl-page-t)), 10px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-sticker-container {
                        --bbgl-sticker-arrow-w: clamp(22px, calc(22px + 18px * var(--bbgl-page-t)), 40px);
                        position: absolute;
                        top: var(--bbgl-toolbar-h);
                        right: 0;
                        bottom: calc(var(--bbgl-sticker-footer-h) + var(--bbgl-sticker-footer-gap));
                        left: 0;
                        padding: 0 var(--bbgl-sticker-arrow-w);
                        container-type: size;
                    }
                    #bbgl-panel.bbgl-mode-page .sticker-nav-btn {
                        top: 0;
                        bottom: 0;
                        font-size: clamp(24px, calc(24px + 8px * var(--bbgl-page-t)), 32px);
                        width: var(--bbgl-sticker-arrow-w);
                        height: clamp(26px, calc(26px + 6px * var(--bbgl-page-t)), 32px);
                    }

                    #bbgl-panel.bbgl-mode-page #sticker-prev-btn {
                        left: clamp(0px, calc(6px * var(--bbgl-page-t)), 6px);
                    }

                    #bbgl-panel.bbgl-mode-page #sticker-next-btn {
                        right: clamp(0px, calc(6px * var(--bbgl-page-t)), 6px);
                    }

                    #bbgl-item-viewer {
                        display: none;
                        flex: 1;
                        width: 100%;
                        height: 100%;
                        background: radial-gradient(circle at center, #2e2e2e 0%, #1a1a1a 100%);
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        border-top: 1px solid #444;
                        overflow: hidden;
                    }

                    #bbgl-item-viewer.active {
                        display: flex;
                    }

                    .viewer-window {
                        width: 95%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                    }

                    .viewer-stage {
                        width: 100%;
                        height: 100%;
                        perspective: 400px;
                        perspective-origin: center 50px;
                        cursor: grab;
                    }

                    .viewer-stage:active {
                        cursor: grabbing;
                    }

                    .viewer-pedestal {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transform-style: preserve-3d;
                    }

                    .viewer-obj {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transform-style: preserve-3d;
                        /* Origin is the box centre, which is also where .layer-front's contained
                           background already centres itself - so scale() alone keeps the sticker
                           centred at any size and NO translate is needed to place it. The old
                           'center 75%' origin pulled content toward a point 75% down as it scaled,
                           and every translateY in these rules existed only to pay that back. With
                           the origin centred, size is the single per-mode knob. Page mode keeps the
                           old origin (see its own rule) so its tuned look is unchanged. */
                        transform-origin: center;
                        transform: rotateX(6deg) scale(.99);
                    }

                    /* Same size curve as before, scaled up by 417.24/353.24 - the ratio between the
                       box this was originally tuned against (which overlapped the header by 64px)
                       and the corrected one - so the sticker renders at its former size.
                       The -10px is NOT box compensation like the translates this refactor removed:
                       it is optical. rotateX tilts the top of the card away from the viewer, and
                       under .viewer-stage's perspective that foreshortens the upper half, so a
                       geometrically centred card reads as sitting slightly low. This nudges it back
                       up. Expanded needs it and compact does not because the lean is a fixed angle
                       against a much taller box here. */
                    .bbgl-expanded:not(.bbgl-mode-page) .viewer-obj {
                        transform: rotateX(4deg) scale(clamp(.886, calc(.98 - .0945 * var(--bbgl-dock-t)), .98)) translateY(-10px);
                    }


                    .viewer-obj img {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                    }

                    .layer-front {
                        position: absolute;
                        z-index: 2;
                        width: 100%;
                        height: 100%;
                        background-size: contain;
                        background-repeat: no-repeat;
                        background-position: center;
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                    }

                    .layer-back {
                        position: absolute;
                        z-index: 1;
                        width: 100%;
                        height: 100%;
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                        background: #eee;
                        background-image: linear-gradient(to bottom, rgba(255, 255, 255, .8) 0%, rgba(200, 200, 200, 1) 100%);
                        transform: rotateY(180deg) scaleX(-1) translateZ(-1px);
                        -webkit-mask-size: contain;
                        mask-size: contain;
                        -webkit-mask-repeat: no-repeat;
                        mask-repeat: no-repeat;
                        -webkit-mask-position: center;
                        mask-position: center;
                        pointer-events: none;
                        filter: brightness(var(--back-brightness, 1));
                    }

                    /* Maker's mark printed on the sticker's paper backing. Real markup rather than a
                       ::after string because the lockup mixes type: a script hero word between two
                       smaller script lines, then a letterspaced tag - a pseudo-element can only carry one
                       set of type styles for its whole content. The stack also stays much narrower than a
                       single horizontal string, which is what let .layer-back's sticker-shaped mask clip
                       only the outer edges of odd silhouettes instead of eating everything but the middle.
                    
                       .layer-back centres this (it is the flex parent) and its scaleX(-1), paired with its
                       rotateY(180deg), means text laid out here reads correctly rather than mirrored.
                       Dancing Script and Barlow Condensed are both already in the shared Google Fonts
                       request, so this costs no extra load. */
                    .lb-brand {
                        /* --lb-x / --lb-y are written by applyBrandAnchor() (09-section-viii-stickers.js):
                           the silhouette's pole of inaccessibility, projected into this element's box.
                           They default to dead centre, which is also the fallback when the anchor cannot
                           be computed (cross-origin read blocked, or the image failed to load). */
                        position: absolute;
                        left: var(--lb-x, 50%);
                        top: var(--lb-y, 50%);
                        display: none;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        /* No in-plane rotation. The lockup used to carry rotate(-9deg) for a stamped look,
                           but once it moved off-centre onto the widest part of the silhouette that angle read
                           as crooked against the figure's own vertical axis. The text is coplanar with the
                           backing, so it still picks up the card's perspective and tilt - that is correct for
                           something printed on the backing, and measures only 0.4-1.8deg of shear at these
                           anchor offsets, against the 9deg this was adding. */
                        transform: translate(-50%, -50%);
                        font-family: 'Dancing Script', 'Segoe Script', cursive;
                        font-weight: 700;
                        line-height: .95;
                        white-space: nowrap;
                        color: rgba(84, 84, 90, .5);
                        /* Letterpress deboss: a light edge below and a dark one above read as ink pressed
                           into the paper rather than text sitting on top of it. */
                        text-shadow: 0 1px 0 rgba(255, 255, 255, .72), 0 -1px 0 rgba(0, 0, 0, .1);
                    }

                    /* Non-image items never get the silhouette mask applied to .layer-back (see
                       openItemViewer), so the brand would sit in a bare rectangle there. */
                    .viewer-obj.is-image .lb-brand {
                        display: flex;
                    }

                    /* Flat px throughout: .viewer-obj's scale() already sizes this along with the sticker,
                       so it stays proportional without a query unit. cq units would be wrong here anyway -
                       the nearest container is inline-size, where cqmin/cqb silently fall back to viewport
                       units. */
                    .lb-brand-sm {
                        font-size: 11px;
                    }

                    .lb-brand-lg {
                        font-size: 22px;
                        margin: -1px 0 0;
                    }

                    .lb-brand-tm {
                        font-size: .46em;
                        vertical-align: super;
                        margin-left: 1px;
                    }

                    .lb-brand-tag {
                        font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
                        font-weight: 500;
                        font-size: 6.5px;
                        letter-spacing: 1.9px;
                        text-transform: uppercase;
                        margin-top: 4px;
                        padding-top: 2px;
                        border-top: 1px solid rgba(84, 84, 90, .32);
                        text-shadow: 0 1px 0 rgba(255, 255, 255, .6);
                    }

                    .viewer-obj.is-image .layer-front::after {
                        content: "";
                        position: absolute;
                        inset: 0;
                        -webkit-mask-image: var(--bg-mask);
                        mask-image: var(--bg-mask);
                        -webkit-mask-size: contain;
                        mask-size: contain;
                        -webkit-mask-repeat: no-repeat;
                        mask-repeat: no-repeat;
                        -webkit-mask-position: center;
                        mask-position: center;
                        background: linear-gradient(115deg, transparent 25%, rgba(0, 255, 255, .4) 40%, rgba(255, 255, 255, .5) 50%, rgba(255, 0, 255, .4) 60%, transparent 75%);
                        background-size: 250% 100%;
                        background-position: var(--sheen-pos, 0% 0%);
                        mix-blend-mode: overlay;
                        opacity: var(--sheen-opacity, 1);
                        pointer-events: none;
                        transition: opacity .1s;
                    }

                    /* Anchored flat to #bbgl-item-viewer's top-left corner in every mode. This used
                       to be four rules carrying per-mode top/left offsets (50px base, 75px expanded,
                       a 43.05px + 31.57px * dock-t curve for expanded panel, a page-mode clamp) -
                       all of them compensation for the header overlap that used to swallow the top
                       of this box in tall mode, and all of them resolving to roughly the same ~7px
                       of VISIBLE inset once that overlap was subtracted. With the box corrected
                       there is nothing left to compensate, so one corner anchor serves all modes. */
                    .viewer-info-overlay {
                        position: absolute;
                        bottom: 12px;
                        left: 12px;
                        text-align: left;
                        pointer-events: none;
                        z-index: 50;
                    }

                    /* The base inset above is compact's: a flat 15/16px ate too much of that small box.
                       Expanded and page are roomy enough to keep the wider inset. */
                    #bbgl-panel.bbgl-expanded .viewer-info-overlay,
                    #bbgl-panel.bbgl-mode-page .viewer-info-overlay {
                        bottom: 15px;
                        left: 16px;
                    }

                    .vi-name {
                        font-size: 11.75px;
                        color: #fff;
                        font-weight: 700;
                        text-transform: none;
                    }

                    .bbgl-expanded .vi-name {
                        font-size: clamp(14px, calc(14px + 1px * var(--bbgl-dock-t)), 15px);
                    }

                    .vi-count {
                        font-size: 9px;
                        color: #aaa;
                        margin-bottom: 2px;
                    }

                    #btn-close-viewer {
                        position: absolute;
                        top: 5px;
                        right: 5px;
                        background: 0 0;
                        border: 1px solid #555;
                        color: #888;
                        font-size: 10px;
                        padding: 2px 6px;
                        cursor: pointer;
                        border-radius: 3px;
                        pointer-events: auto;
                        transition: all .2s;
                    }

                    #btn-close-viewer:hover {
                        border-color: #fff;
                        color: #fff;
                        background: #333;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-item-viewer {
                        aspect-ratio: auto;
                    }

                    .bbgl-mode-page #bbgl-item-viewer.active {
                        display: flex !important;
                        width: 100% !important;
                        height: calc(100vh - 420px + 60px * var(--bbgl-page-t));
                        min-height: clamp(300px, calc(300px + 200px * var(--bbgl-page-t)), 500px);
                        border: none;
                        border-radius: 0 0 5px 5px;
                        box-sizing: border-box;
                        flex: none !important;
                    }

                    #bbgl-page-container .bbgl-mode-page:has(#bbgl-item-viewer.active) {
                        flex: none;
                    }

                    .bbgl-mode-page .vi-name {
                        font-size: clamp(14px, calc(14px + 2px * var(--bbgl-page-t)), 16px) !important;
                    }

                    .bbgl-mode-page .vi-count {
                        font-size: clamp(8px, calc(8px + 1px * var(--bbgl-page-t)), 9px);
                    }

                    .bbgl-mode-page #btn-close-viewer {
                        font-size: clamp(9px, calc(9px + 1px * var(--bbgl-page-t)), 10px);
                        padding: 2px clamp(5px, calc(5px + 1px * var(--bbgl-page-t)), 6px);
                        top: clamp(4px, calc(4px + 1px * var(--bbgl-page-t)), 5px) !important;
                        right: clamp(4px, calc(4px + 1px * var(--bbgl-page-t)), 5px) !important;
                    }

                    .bbgl-mode-page .viewer-window,
                    .bbgl-mode-page .viewer-stage,
                    .bbgl-mode-page .viewer-pedestal {
                        width: clamp(85%, calc(85% + 7% * var(--bbgl-page-t)), 92%) !important;
                        height: clamp(85%, calc(85% + 7% * var(--bbgl-page-t)), 92%);
                    }

                    /* Inherits the centred origin from .viewer-obj, so this is size only - the
                       translateY (20-25px) and translateX (10-20px) it used to carry were placement
                       against the old 'center 75%' origin and are gone with it. */
                    .bbgl-mode-page .viewer-obj {
                        transform: rotateX(4deg) scale(calc(1.22 + .33 * (1 - var(--bbgl-page-t)))) !important;
                    }

                    #bbgl-bottom-panel {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        padding: 0;
                        box-sizing: border-box;
                        overflow: hidden;
                    }

                    .bbgl-header-wrapper {
                        position: relative;
                        padding: 0 0 2px 0;
                        margin-bottom: 0;
                        border-bottom: none;
                        flex: 0 0 95px;
                        overflow: visible;
                        z-index: 20;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-end;
                    }

                    .bbgl-header-wrapper::before {
                        content: "";
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        width: auto;
                        height: auto;
                        background-image: url('${ASSETS.HEADER_IMG}');
                        background-size: 100% 100%;
                        background-position: center;
                        opacity: 0.85;
                        z-index: -1;
                        pointer-events: none;
                        border-radius: 3px 3px 0 0;
                        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-header-wrapper {
                        flex: 0 0 130px;
                    }

                    .bbgl-month-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 4px 8px 0 12px;
                        gap: 8px;
                        position: relative;
                        margin-bottom: 4px;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-month-header {
                        gap: clamp(6px, calc(6px + 6px * var(--bbgl-dock-t)), 12px);
                        margin-bottom: 12px;
                    }

                    .arrow-btn {
                        background: 0 0;
                        border: none;
                        color: #fff;
                        font-size: 18px;
                        cursor: pointer;
                        padding: 0 5px;
                        font-weight: 700;
                        user-select: none;
                        line-height: 1;
                        text-shadow: 0 1px 3px #000;
                        align-self: flex-end;
                        margin-bottom: 4px;
                        transition: transform .2s, text-shadow .2s;
                        will-change: transform; /* same reason as .stats-btn / .header-trigger */
                    }

                    @media (hover: hover) {
                        .arrow-btn:hover {
                            color: #fff;
                            transform: scale(1.3);
                            text-shadow: 0 0 8px rgba(255, 255, 255, .8);
                        }
                    }

                    .arrow-btn:active {
                        color: #fff;
                        transform: scale(1.3);
                        text-shadow: 0 0 8px rgba(255, 255, 255, .8);
                    }

                    .title-group {
                        flex-grow: 1;
                        text-align: left;
                        padding-left: 0;
                        transform: translate(0px, -2px);
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                        align-items: flex-start;
                        gap: 3px;
                        /* transform makes this a stacking-context root, so the
                           dropdown's z-index is scoped here. */
                        position: relative;
                    }

                    /* Only lift .title-group above #bbgl-level-container (z-index:10) while a
                       dropdown is actually open, so the menu paints over the exp bar — the rest
                       of the time it stays at its normal stacking position. Elevating it
                       unconditionally (the old approach) made its whole box win any overlap with
                       the level bar's crown/diamond badge beneath it, across the entire header
                       row width, which is more than this ever actually needs. */
                    .title-group:has(.bbgl-dropdown-menu.show) {
                        z-index: 30;
                    }

                    /* gap is the single source of row-to-row spacing, shared across
                       modes by default so every row-pair gap matches. Only override
                       it (paired with a compensating margin-top so the bottom row
                       doesn't move) when a mode genuinely needs a different value —
                       see .bbgl-compact below. */
                    .title-stack {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 3px;
                    }

                    #bbgl-panel.bbgl-expanded .title-stack {
                        margin-top: -4px;
                    }
                    #bbgl-panel.bbgl-expanded .title-group {
                        gap: 6px;
                    }
                    #bbgl-panel.bbgl-compact .title-group {
                        gap: 1px;
                    }

                    /* Gap reduced 1px (3px -> 2px) for both row-pairs; margin-top
                       pushes the whole stack down by 2px (1px per shrunk gap,
                       compounding down to the bottom row) so the month row — the
                       last one — stays exactly where it was before this change. */
                    #bbgl-panel.bbgl-compact .title-stack {
                        gap: 2px;
                        margin-top: 2px;
                    }

                    /* Gap now fluid: 7px at min panel width -> 15px at max (was a
                       flat 11px, which is why it looked unchanged at max size).
                       margin-top compensates 2px per px of gap growth (both gaps,
                       compounding down to the bottom row) against the true 3px
                       original gap, so month stays anchored across the whole
                       width range, not just at the two ends. NOTE: the original
                       -8px/-12px bounds here were already a dead clamp (backwards
                       min/max order == always evaluates to -8px flat) predating
                       this change — left as-is, just accounted for correctly. */
                    #bbgl-panel.bbgl-mode-page .title-stack {
                        gap: clamp(3px, calc(3px + 8px * var(--bbgl-page-t)), 11px);
                        /* Also absorbs the all-time row's -2px margin-bottom below. */
                        margin-top: clamp(-22px, calc(-6px - 16px * var(--bbgl-page-t)), -6px);
                    }
                    #bbgl-panel.bbgl-mode-page .title-group {
                        gap: clamp(6px, calc(8px - 2px * var(--bbgl-page-t)), 8px);
                    }

                    /* NOTE: #all-time-btn only ever carries class="stats-btn" — a
                       former .all-time-btn class rule set here never matched
                       anything and was removed. Sizing/hover for the all-time
                       icon comes entirely from the shared .stats-btn rules below. */

                    /* Row height is pinned to the icon's own height (identical in
                       every row), NOT the label's — labels vary wildly in size
                       (9px-34px) and would otherwise make row height, and thus the
                       gap between icons, inconsistent per row. The icon therefore
                       always exactly fills its row; a label taller than the row
                       overflows upward, which is harmless. align-items:flex-end
                       (not center) because .stats-btn's SVG is only 78% of its own
                       box and bottom-aligned within it — the box's visual bottom
                       matches its box-bottom exactly, but its visual top doesn't,
                       so bottom-alignment is what actually lines up the visible
                       icon and label; centering the boxes would not center the
                       visible content. .stats-btn / .header-trigger both add the
                       same hardcoded -6px settled offset so they move together.
                       --trigger-lift / --btn-lift: live per-element tuning knobs
                       (delta from the settled -6px baseline), default 0 = no change. */
                    .header-row {
                        display: flex;
                        align-items: flex-end;
                        gap: 2px;
                        position: relative;
                        height: 16px;
                        --trigger-lift: 0px;
                        --btn-lift: 0px;
                    }

                    #bbgl-panel.bbgl-expanded .header-row {
                        gap: 6px;
                        height: clamp(20px, calc(20px + 7px * var(--bbgl-dock-t)), 27px);
                        --btn-lift: -4px;
                    }

                    #bbgl-panel.bbgl-expanded .header-row--month {
                        --btn-lift: -1px;
                    }

                    #bbgl-panel.bbgl-mode-page .header-row {
                        gap: clamp(3px, calc(3px + 3px * var(--bbgl-page-t)), 6px);
                        height: clamp(21px, calc(21px + 10px * var(--bbgl-page-t)), 31px);
                    }

                    /* Row-to-row spacing comes ONLY from .title-stack's gap above —
                       every row is a fixed, identical height (icon-sized), so the
                       gap between any two adjacent rows is guaranteed equal in
                       every panel mode, both mathematically and visually. */

                    .header-row--year {
                        --trigger-lift: -4px;
                    }

                    /* Year label is bottom-aligned like month/all-time (align-items:flex-end
                       on .header-row, inherited — no per-element override needed), so its
                       position stays pinned to the row's bottom edge regardless of the row's
                       own height. Previously this was align-self:center, which made the
                       label's position depend on the row's total height — fine at a fixed
                       height, but it drifted as the row's fluid height clamp (expanded mode)
                       changed with panel width. flex-end sidesteps that entirely. */

                    /* #all-time-trigger's font is by far the largest of the three
                       (20-34px vs 9-29px), so line-height:1's descent reservation
                       is proportionally biggest here — nudge the label down to
                       compensate. Starting estimate, not measured against a live
                       render; adjust as needed. */
                    .header-row--alltime {
                        --trigger-lift: 3px;
                    }



.stats-btn {
                        display: flex;
                        align-items: flex-end;
                        justify-content: center;
                        pointer-events: none;
                        opacity: .95;
                        transition: all .2s;
                        align-self: flex-end;
                        transform-origin: center bottom;
                        transform: translate(-5px, calc(-6px + var(--btn-lift, 0px)));
                        /* Permanent layer: the hover jump/scale and glow (transform + filter transitions)
                           otherwise got a layer created at hover start and dropped at the end, regrouping
                           and repainting the header content drawn around and after the button. */
                        will-change: transform, filter;
                    }

                    /* Same translate as rest, scaled from the bottom edge, so hover/active never
                       moves the button's bottom off its label. */
                    .stats-btn:hover, .stats-btn.active {
                        opacity: 1;
                        transform: translate(-5px, calc(-6px + var(--btn-lift, 0px))) scale(1.15);
                        filter: drop-shadow(0 0 6px rgba(216, 150, 224, 0.9)) drop-shadow(0 0 2px rgba(171, 71, 188, 1));
                    }

                    #bbgl-panel.bbgl-compact .header-row {
                        --btn-lift: -2.5px;
                    }

                    #bbgl-panel.bbgl-compact .header-row--month {
                        --btn-lift: -1.5px;
                    }
                    #bbgl-panel.bbgl-compact .header-row--year {
                        --trigger-lift: -3px;
                    }
                    #bbgl-panel.bbgl-mode-page .header-row--year {
                        --trigger-lift: -1px;
                    }
                    #bbgl-panel.bbgl-mode-page .header-row--month {
                        --trigger-lift: 1px;
                    }
                    #bbgl-panel.bbgl-mode-page .header-row--alltime {
                        margin-bottom: -2px;
                    }

                    .stats-btn svg {
                        width: 100%;
                        height: 100%;
                        pointer-events: auto;
                        cursor: pointer;
                    }

                    .header-trigger {
                        font-family: 'Fjalla One', 'Arial Narrow', sans-serif;
                        font-weight: 400;
                        color: #fff;
                        cursor: pointer;
                        text-transform: capitalize;
                        user-select: none;
                        text-shadow: 0 2px 4px #000;
                        line-height: 1;
                        transform: translateY(calc(-6px + var(--trigger-lift, 0px)));
                        /* Own layer, like .stats-btn: the triggers paint after the chart buttons and sit
                           inside their hover glow, so a button's hover otherwise regrouped and repainted
                           them. (Rows aren't isolated instead: that would trap each dropdown's z-index
                           inside its row, under the rows painted after it.) */
                        will-change: transform;
                    }

                    .header-trigger:hover {
                        opacity: .8;
                    }

                    .header-trigger::after {
                        content: '▼';
                        font-size: 8px;
                        opacity: .5;
                        margin-left: 3px;
                        vertical-align: middle;
                        position: relative;
                        top: -1px;
                    }

                    .header-trigger.disabled {
                        cursor: default;
                        pointer-events: none;
                    }

                    .header-trigger.disabled::after {
                        display: none;
                    }

                    #year-trigger {
                        font-size: 9px;
                    }

                    #month-trigger {
                        font-size: 14px;
                    }

                    #all-time-trigger {
                        font-size: 20px;
                    }
                    #all-time-trigger::after {
                        display: none;
                    }

                    #year-stats-btn, #month-stats-btn, #all-time-btn {
                        width: 15px;
                        height: 14px;
                    }

                    #bbgl-panel.bbgl-mode-page #year-trigger {
                        font-size: clamp(12px, calc(12px + 7px * var(--bbgl-page-t)), 19px);
                    }

                    #bbgl-panel.bbgl-mode-page #month-trigger {
                        font-size: clamp(18px, calc(18px + 11px * var(--bbgl-page-t)), 29px);
                    }

                    #bbgl-panel.bbgl-mode-page #all-time-trigger {
                        font-size: clamp(24px, calc(24px + 10px * var(--bbgl-page-t)), 34px);
                    }

                    #bbgl-panel.bbgl-mode-page #year-stats-btn,
                    #bbgl-panel.bbgl-mode-page #month-stats-btn,
                    #bbgl-panel.bbgl-mode-page #all-time-btn {
                        width: clamp(20px, calc(20px + 10px * var(--bbgl-page-t)), 30px);
                        height: clamp(21px, calc(21px + 10px * var(--bbgl-page-t)), 31px);
                    }

                    #bbgl-panel.bbgl-mode-page .arrow-btn {
                        font-size: clamp(16px, calc(16px + 12px * var(--bbgl-page-t)), 28px);
                        margin-bottom: clamp(4px, calc(4px + 2px * var(--bbgl-page-t)), 6px);
                    }

                    #bbgl-panel.bbgl-mode-page .header-trigger::after {
                        font-size: clamp(10px, calc(10px + 2px * var(--bbgl-page-t)), 12px);
                    }

                    .bbgl-dropdown-menu {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        background: #222;
                        border: 1px solid #444;
                        border-radius: 4px;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, .95);
                        z-index: 100;
                        display: none;
                        padding: 4px;
                        gap: 2px;
                    }

                    .bbgl-dropdown-menu.show {
                        display: grid;
                    }

                    #bbgl-month-dropdown {
                        grid-template-columns: repeat(3, 1fr);
                        min-width: 140px;
                    }

                    #bbgl-year-dropdown {
                        display: none;
                        flex: 1;
                        flex-direction: column;
                        width: max-content;
                        min-width: 60px;
                    }

                    #bbgl-year-dropdown.show {
                        display: flex;
                    }

                    .drop-item {
                        padding: 8px 12px;
                        font-size: 11px;
                        color: #999;
                        cursor: pointer;
                        text-align: center;
                        border-radius: 3px;
                    }

                    #bbgl-panel.bbgl-expanded .drop-item {
                        font-size: clamp(11px, calc(11px + 2px * var(--bbgl-dock-t)), 13px);
                    }

                    .drop-item:hover {
                        background: #333;
                        color: #fff;
                    }

                    .drop-item.active {
                        background: #7b2fbe;
                        color: #fff;
                    }

                    .bbgl-grid-container {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        padding: 0 2px;
                        overflow: hidden;
                        min-height: 0;
                        position: relative;
                        z-index: 1;
                    }

                    .bbgl-week-row {
                        display: grid;
                        grid-template-columns: repeat(7, 1fr);
                        text-align: center;
                        color: #888;
                        font-size: 10px;
                        margin-bottom: 0;
                        font-family: 'Fjalla One', 'Arial Narrow', sans-serif;
                        padding-top: 1px;
                        border-top: none;
                        flex: 0 0 auto;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-week-row {
                        font-size: clamp(11px, calc(11px + 2px * var(--bbgl-dock-t)), 13px);
                        padding-top: 5px;
                        margin-bottom: 2px;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-week-row {
                        font-size: clamp(11px, calc(11px + 4px * var(--bbgl-page-t)), 15px);
                        padding-top: clamp(3px, calc(3px + 5px * var(--bbgl-page-t)), 8px);
                        margin-bottom: clamp(2px, calc(2px + 2px * var(--bbgl-page-t)), 4px);
                    }

                    .bbgl-week-row span {
                        border-right: 1px solid rgba(255, 255, 255, .05);
                    }

                    .bbgl-week-row span:last-child {
                        border-right: none;
                    }

                    .calendar-wrapper {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        overflow-y: auto;
                        overflow-x: hidden;
                        position: relative;
                        background: #333;
                    }

                    .bbgl-cal-container {
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        touch-action: pan-y;
                        border-top: 1px solid rgba(255, 255, 255, .05);
                        border-left: 1px solid rgba(255, 255, 255, .05);
                    }

                    /* One calendar week: its row of day cells and the weekly bar under it. Its own
                       stacking context, so the bar's z-index:20 (and the handle growing up into the
                       row) only ranks above this week's cells, not every cell in the grid, and a
                       layer appearing on hover is only overlap-checked against this week. Plain
                       block stacking row-then-bar, so layout is unchanged. */
                    .bbgl-week {
                        isolation: isolate;
                        /* Each week permanently on its own layer, for the same reason as the day cells:
                           weeks paint top to bottom, and the week bar's hover changes (sweeps starting,
                           handle growing, its shadows reaching a few px past the week's bottom edge) made
                           the browser regroup the week painted after it into a new layer and repaint it. */
                        will-change: transform;
                    }

                    .bbgl-row-slice {
                        display: flex;
                        width: 100%;
                        background-image: var(--bg-url);
                        background-size: 100% calc(100% * var(--total-rows));
                        background-position: center calc(var(--row-idx) * 100% / (var(--total-rows) - 1));
                        background-repeat: no-repeat;
                    }

                    .bbgl-day-cell {
                        flex: 1;
                        aspect-ratio: 1/1;
                        display: block;
                        position: relative;
                        cursor: pointer;
                        background: 0 0;
                        box-shadow: none;
                        border-bottom: 1px solid rgba(255, 255, 255, .05);
                        border-right: 1px solid rgba(255, 255, 255, .05);
                        transition: transform .1s;
                        overflow: hidden;
                        /* Own stacking context, so the z-indexes inside (sticker 15, post-its 17, day
                           number 20) order only this cell's contents instead of competing across the
                           whole grid. Without it, a post-it peel or shine starting in one cell made the
                           browser treat every later day number/sticker/handle in the grid as possibly
                           overlapping it, and re-layer + repaint them all. overflow:hidden already
                           keeps everything inside the cell, so nothing changes visually. */
                        isolation: isolate;
                        /* Every cell permanently on its own layer. Cells paint in order within a week,
                           so a layer appearing inside one hovered cell forced every cell painted after
                           it (to the end of the week) to be regrouped into a new layer above it. With
                           each cell already a separate layer in the right order, there's nothing left
                           to regroup and a hovered cell only repaints itself. */
                        will-change: transform;
                        user-select: none;
                        -webkit-user-select: none;
                    }

                    .bbgl-day-cell.empty {
                        background: 0 0;
                        box-shadow: none;
                        cursor: default;
                        pointer-events: none;
                    }

                    /* Event post-it notes — War and OD visual indicators on calendar cells. */
                    .bbgl-event-post-it {
                        position: absolute;
                        top: calc(4% - max(0, var(--stack-total, 1) - 1) * 6% + var(--ei, 0) * 9%);
                        left: 4%;
                        width: 92%;
                        height: 92%;
                        background: no-repeat center / contain;
                        z-index: 17;
                        filter: drop-shadow(-2px 4px 5px rgba(0, 0, 0, .4));
                        transform-origin: top right;
                        transition: transform .35s ease-out, top .35s ease-out;
                        pointer-events: none;
                        transform: rotate(calc(-4deg + var(--ei, 0) * -3deg));
                    }

                    /* Sticker awarded that day (cleared or not): the whole stack peels together. Staggered so the
                       topmost note (the one covering everything) leaves with zero delay the
                       moment you hover, while notes further down follow in sequence behind it. */
                    body:not(.is-touch-device) .bbgl-day-cell.has-sticker:not(.empty).is-hover-intent .bbgl-event-post-it,
                    .bbgl-day-cell.has-sticker.is-scrub-hovered .bbgl-event-post-it,
                    .bbgl-day-cell.has-sticker.is-viewing .bbgl-event-post-it {
                        transform: translateX(110%) translateY(-20%) rotate(20deg);
                        transition: transform .25s ease-in;
                        transition-delay: calc(((var(--stack-total, 1) - 1) - var(--ei, 0)) * 0.15s);
                    }

                    /* No sticker awarded that day: only the note actually blocking the stack (marked
                       .bbgl-event-post-it-top, only ever added when there's more than one note)
                       peels away, revealing whatever's fanned out underneath. A lone post-it with
                       no sticker underneath never moves. */
                    body:not(.is-touch-device) .bbgl-day-cell:not(.empty).is-hover-intent:not(.has-sticker) .bbgl-event-post-it-top,
                    .bbgl-day-cell.is-scrub-hovered:not(.has-sticker) .bbgl-event-post-it-top,
                    .bbgl-day-cell.is-viewing:not(.has-sticker) .bbgl-event-post-it-top {
                        transform: translateX(110%) translateY(-20%) rotate(20deg);
                        transition: transform .25s ease-in;
                    }

                    .bbgl-day-cell.is-plate {
                        z-index: 2;
                        border-bottom: 1px solid rgba(0, 0, 0, .4);
                        border-right: 1px solid rgba(0, 0, 0, .4);
                    }

                    .bbgl-day-cell.ghost-cell .jewel-wrapper {
                        opacity: .6;
                    }

                    .jewel-wrapper {
                        position: absolute;
                        top: 50%;
                        left: 53%;
                        width: 80%;
                        height: 78%;
                        transform: translate(-50%, -50%);
                        pointer-events: none;
                        z-index: 10;
                        filter: drop-shadow(0 3px 2px rgba(0, 0, 0, .5));
                    }

                    .jewel-asset {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                        position: absolute;
                        top: 0;
                        left: 0;
                    }

                    .jewel-shine {
                        position: absolute;
                        inset: 0;
                        pointer-events: none;
                        -webkit-mask-size: contain;
                        mask-size: contain;
                        -webkit-mask-repeat: no-repeat;
                        mask-repeat: no-repeat;
                        -webkit-mask-position: center;
                        mask-position: center;
                    }

                    /* gold-roll, split in two: the fade stays on .jewel-shine, the travel moves to
                       .jewel-shine-band as a transform. Both run with the same duration and easing, so
                       each property eases over the same keyframe segments as the combined original. */
                    @keyframes gold-roll-fade {
                        0% {
                            opacity: 0
                        }

                        15% {
                            opacity: 1
                        }

                        100% {
                            opacity: 1
                        }
                    }

                    @keyframes gold-roll-band {
                        0% {
                            transform: translateX(-62.5%)
                        }

                        100% {
                            transform: translateX(-15.625%)
                        }
                    }

                    .jewel-type-gold .jewel-asset {
                        transform: rotate(90deg) scale(1.25) translateZ(0);
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                    }

                    /* The moving gradient lives on an inner band (.jewel-shine-band) that slides with
                       transform, instead of animating this element's background-position. That
                       repainted the gradient through the mask + blend every frame; now the band is
                       rasterized once and only moved. overflow:hidden limits the band to this box,
                       which is exactly where the background used to paint. */
                    .jewel-type-gold .jewel-shine {
                        transform: scale(1.2);
                        filter: brightness(1.2);
                        overflow: hidden;
                        mix-blend-mode: soft-light;
                        opacity: 0;
                        transition: opacity .2s;
                    }

                    /* Geometry mirrors the old background exactly: one gradient tile was 200% x 100%
                       of the box (2 box widths), repeating, travelling from background-position 200%
                       (offset -2 widths, = 0% one tile over) to 50% (offset -0.5 widths). Covering the
                       box across that range needs a band 3 widths wide; it is 3.2 for a sliver of
                       margin, and kept that small because the whole band is rasterized when the shine
                       starts. In its own width: tile = 2/3.2, -2 widths = -62.5%, -0.5 = -15.625%. */
                    .jewel-type-gold .jewel-shine-band {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 320%;
                        height: 100%;
                        background: linear-gradient(135deg, transparent 25%, rgba(255, 240, 180, 1) 45%, rgba(255, 255, 255, 1.0) 50%, rgba(255, 240, 180, 1) 55%, transparent 75%);
                        background-size: 62.5% 100%;
                        transform: translateX(-62.5%);
                    }

                    .jewel-type-green .jewel-asset {
                        transform: scale(1.23) translateZ(0);
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                    }

                    /* Green and diamond jewels share the same shine gradients; only the
                       transforms differ per type. */
                    /* Same inner-band technique as gold (see .jewel-type-gold .jewel-shine): the
                       gradients below now live on each element's .jewel-shine-band child, which slides
                       with transform, and the element itself clips it (overflow:hidden) and keeps the
                       mask, blend mode and per-type transform. */
                    .jewel-type-green .jewel-shine,
                    .jewel-type-diamond .jewel-shine {
                        overflow: hidden;
                        mix-blend-mode: screen;
                        opacity: 0;
                    }

                    /* Old background: 300% x 100% tiles, repeating, animated from background-position
                       250% to 50% (an offset of -5 to -1 box widths, i.e. more than one whole tile of
                       travel). A two-tile (600%) band covers the box across that whole range:
                       translateX(-5/6) and translateX(-1/6) of the band's own width are exactly those
                       two offsets. At rest it sits at -50% (one whole tile = position 0%). */
                    :is(.jewel-type-green, .jewel-type-diamond) :is(.jewel-shine, .jewel-shine-over) > .jewel-shine-band {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 600%;
                        height: 100%;
                        background-size: 50% 100%;
                        transform: translateX(-50%);
                    }

                    :is(.jewel-type-green, .jewel-type-diamond) .jewel-shine > .jewel-shine-band {
                        background-image: linear-gradient(120deg, transparent 10%, rgba(0, 220, 110, .4) 28%, rgba(180, 255, 210, .95) 40%, rgba(255, 255, 255, 1.0) 50%, rgba(180, 255, 210, .95) 60%, rgba(0, 220, 110, .4) 72%, transparent 90%);
                    }

                    :is(.jewel-type-green, .jewel-type-diamond) .jewel-shine-over > .jewel-shine-band {
                        background-image: linear-gradient(120deg, transparent 0%, rgba(120, 255, 180, .5) 41%, rgba(255, 255, 255, .7) 50%, rgba(120, 255, 180, .5) 59%, transparent 100%);
                    }

                    .jewel-type-green .jewel-shine-over,
                    .jewel-type-diamond .jewel-shine-over {
                        position: absolute;
                        z-index: 3;
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                        mix-blend-mode: soft-light;
                        opacity: 0;
                        -webkit-mask-image: var(--jewel-mask);
                        mask-image: var(--jewel-mask);
                        -webkit-mask-size: contain;
                        mask-size: contain;
                        -webkit-mask-repeat: no-repeat;
                        mask-repeat: no-repeat;
                        -webkit-mask-position: center;
                        mask-position: center;
                    }

                    .jewel-type-green .jewel-shine {
                        transform: scale(1.18);
                    }

                    .jewel-type-green .jewel-shine-over {
                        transform: scale(1.23);
                    }

                    .jewel-type-diamond .jewel-asset {
                        transform-origin: bottom left;
                        transform: translate(-6%, 6%) scale(1.08, 1.06) translateZ(0);
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                    }

                    .jewel-type-diamond .jewel-shine,
                    .jewel-type-diamond .jewel-shine-over {
                        transform-origin: bottom left;
                        transform: translate(-3%, 3%) scale(1.02, 1.00);
                    }

                    /* green-flash / green-flash-over, split like gold-roll: the fades stay on the
                       elements, the shared travel moves to their bands. Same 1.7s ease-out on all of
                       them, so each property eases over the same keyframe segments as before. */
                    @keyframes green-flash-fade {
                        0% {
                            opacity: 0
                        }

                        20% {
                            opacity: .9
                        }

                        100% {
                            opacity: .75
                        }
                    }

                    @keyframes green-flash-over-fade {
                        0% {
                            opacity: 0
                        }

                        20% {
                            opacity: .72
                        }

                        100% {
                            opacity: .95
                        }
                    }

                    @keyframes green-flash-band {
                        0% {
                            transform: translateX(calc(-100% * 5 / 6))
                        }

                        100% {
                            transform: translateX(calc(-100% / 6))
                        }
                    }

                    .sticker-wrapper {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 80%;
                        height: 80%;
                        transform: translate(-50%, -50%) rotate(var(--rot, 0deg));
                        pointer-events: none;
                        z-index: 15;
                        filter: drop-shadow(0 2px 3px rgba(0, 0, 0, .5));
                    }

                    .cell-sticker-deco {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                        filter: brightness(.9) sepia(.2) contrast(1.1);
                        transition: transform .2s;
                    }

                    .new-sticker-post-it {
                        position: absolute;
                        top: 4%;
                        left: 4%;
                        width: 92%;
                        height: 92%;
                        background: url('${ASSETS.NEW_STICKER_FRAME}') no-repeat center / contain;
                        z-index: 20;
                        filter: drop-shadow(-2px 4px 5px rgba(0, 0, 0, .4));
                        transform-origin: top right;
                        transition: transform .6s cubic-bezier(.5, 0, 1, 1);
                        cursor: pointer;
                        transform: rotate(-5deg);
                    }

                    .post-it-rip {
                        transform: translateX(250%) translateY(-80%) rotate(75deg) scale(1.3) !important;
                        pointer-events: none;
                    }

                    /* Same inner-band technique as the jewel shines: the gradient (set inline per tier by
                       buildShine, 07-section-vi-ui.js) lives on .sticker-shine-band, which slides with
                       transform. This element keeps the mask, blend mode, brightness filter and rounded
                       corners, and clips the band (overflow:hidden). */
                    .sticker-shine {
                        position: absolute;
                        inset: 0;
                        overflow: hidden;
                        mix-blend-mode: overlay;
                        opacity: 0;
                        border-radius: 4px;
                        -webkit-mask-mode: alpha;
                        mask-mode: alpha;
                        -webkit-mask-size: contain;
                        mask-size: contain;
                        -webkit-mask-repeat: no-repeat;
                        mask-repeat: no-repeat;
                        -webkit-mask-position: center;
                        mask-position: center;
                    }

                    /* Old background: 400% x 400% tiles, repeating, animated diagonally from
                       background-position 0% 0% to 100% 100% (an offset of 0 to -3 box widths/heights),
                       resting at 50% 50%. Covering the box across that range needs 4 box sizes each way;
                       the band is 4.5 for a little margin, and no bigger because the whole band is
                       rasterized when the shine starts (an 8x8 band was 64x the sticker's pixels). In its
                       own size: tile = 4/4.5, -3 = -66.667%, the 50% rest (-1.5) = -33.333%. */
                    .sticker-shine-band {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 450%;
                        height: 450%;
                        background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(200, 250, 255, .001) 30%, rgba(255, 255, 255, .01) 50%, rgba(255, 200, 220, .001) 70%, rgba(255, 255, 255, 0) 100%);
                        background-size: calc(100% * 4 / 4.5) calc(100% * 4 / 4.5);
                        transform: translate(calc(-100% / 3), calc(-100% / 3));
                    }

                    /* The old keyframes held opacity at .85 at both ends, i.e. a constant — so the
                       outer element now just sits at .85 while active, and only the band animates. */
                    @keyframes bbgl-auto-shimmer-band {
                        0% {
                            transform: translate(0, 0)
                        }

                        100% {
                            transform: translate(calc(-100% * 2 / 3), calc(-100% * 2 / 3))
                        }
                    }

                    @keyframes bbgl-slide-in-l {
                        from {
                            transform: translateX(-100%)
                        }

                        to {
                            transform: translateX(0)
                        }
                    }

                    @keyframes bbgl-slide-in-r {
                        from {
                            transform: translateX(100%)
                        }

                        to {
                            transform: translateX(0)
                        }
                    }

                    @keyframes bbgl-slide-out-l {
                        from {
                            transform: translateX(0)
                        }

                        to {
                            transform: translateX(-100%)
                        }
                    }

                    @keyframes bbgl-slide-out-r {
                        from {
                            transform: translateX(0)
                        }

                        to {
                            transform: translateX(100%)
                        }
                    }

                    .bbgl-cal-ghost {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        pointer-events: none;
                        z-index: 10;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) .jewel-type-gold .jewel-shine {
                        opacity: 1;
                        animation: gold-roll-fade 1.2s cubic-bezier(.3, 0, .55, 1) 1 forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) .jewel-type-gold .jewel-shine-band {
                        animation: gold-roll-band 1.2s cubic-bezier(.3, 0, .55, 1) 1 forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) :is(.jewel-type-green, .jewel-type-diamond) .jewel-shine {
                        opacity: 1;
                        animation: green-flash-fade 1.7s ease-out 1 forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) :is(.jewel-type-green, .jewel-type-diamond) .jewel-shine-over {
                        opacity: 1;
                        animation: green-flash-over-fade 1.7s ease-out 1 forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) :is(.jewel-type-green, .jewel-type-diamond) :is(.jewel-shine, .jewel-shine-over) > .jewel-shine-band {
                        animation: green-flash-band 1.7s ease-out 1 forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) .sticker-shine-band {
                        animation: bbgl-auto-shimmer-band 2.4s cubic-bezier(.3, 0, .55, 1) 2 alternate forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) .sticker-shine {
                        opacity: .85;
                    }

                    .day-num {
                        --day-num-size: 18px;
                        position: absolute;
                        top: 3px;
                        left: 2px;
                        font-size: 10px;
                        width: var(--day-num-size);
                        height: var(--day-num-size);
                        color: #fff;
                        font-weight: 400;
                        font-family: 'Fjalla One', 'Arial', sans-serif;
                        pointer-events: none;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        /* Explicit list instead of "all": hover flips transform between none and
                           scale(1), which look identical but still started a transform transition (and
                           a re-layering) on every cell hover. Everything that visibly changes across
                           the day-number states is still listed. */
                        transition: color .2s, background .2s, font-size .2s, width .2s, height .2s, top .2s, left .2s, z-index .2s;
                        z-index: 20;
                    }

                    .bbgl-day-cell.ghost-cell .day-num {
                        color: #999;
                    }

                    body:not(.is-touch-device) .bbgl-day-cell:not(.empty):not(.is-viewing).is-hover-intent .day-num,
                    .bbgl-day-cell:not(.empty):not(.is-viewing).is-scrub-hovered .day-num {
                        color: #fff;
                        background: #555;
                        transform: scale(1);
                    }

                    .bbgl-day-cell.is-viewing .day-num {
                        color: #fff;
                        background: #888;
                        transform: none;
                        z-index: 50;
                        font-size: 12px !important;
                    }

                    .bbgl-weekly-anchor {
                        width: 100%;
                        height: 15px;
                        position: relative;
                        z-index: 20;
                        --bbgl-tab-w: 44px;
                        --bbgl-track-h: 15px;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-weekly-anchor {
                        height: 12px;
                        --bbgl-tab-w: 28px;
                        --bbgl-track-h: 12px;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-weekly-anchor {
                        --bbgl-tab-w: clamp(32px, calc(32px + 12px * var(--bbgl-dock-t)), 44px);
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-weekly-anchor {
                        --bbgl-tab-w: clamp(32px, calc(32px + 12px * var(--bbgl-page-t)), 44px);
                    }

                    .bbgl-weekly-track {
                        position: absolute;
                        bottom: 0;
                        left: var(--bbgl-tab-w);
                        width: calc(100% - var(--bbgl-tab-w));
                        height: 15px;
                        display: flex;
                        cursor: pointer;
                        border-radius: 0 4px 4px 0;
                        overflow: hidden;
                        /* Contains the sweep animations that start on hover, so the browser's overlap
                           check treats the track as one clipped group rather than re-layering (and
                           repainting) everything painted after it in the calendar. overflow:hidden
                           already clips the sweeps to the track, so nothing changes visually. */
                        isolation: isolate;
                        pointer-events: auto;
                        background: repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(255,255,255,.012) 1px, rgba(255,255,255,.012) 2px), linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%);
                        box-shadow: none;
                        z-index: 1;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-weekly-track {
                        height: 12px;
                    }


                    #bbgl-panel.bbgl-no-animations .bbgl-day-cell.is-viewing :is(.jewel-type-gold .jewel-shine, .jewel-shine-band, .jewel-type-green .jewel-shine, .jewel-type-green .jewel-shine-over, .jewel-type-diamond .jewel-shine, .jewel-type-diamond .jewel-shine-over, .sticker-shine, .sticker-shine-band) {
                        animation: none !important;
                        opacity: 0 !important;
                    }

                    /* Weekly-bar capsule sweep — was per-capsule SMIL (<animateTransform>/<animate>)
                       inside the SVG, then a shared CSS animation on an SVG shape. Neither got a
                       real GPU compositor layer (inline SVG shapes don't reliably get one for
                       transform/opacity, especially combined with clip-path), so both still forced
                       real per-frame repainting. This is now a plain HTML overlay instead: each lit
                       capsule's fill window gets a small position:absolute, overflow:hidden div
                       (bbgl-cap-win) placed over the SVG via percentages of the shared track (the
                       SVG's viewBox scales the same way, so they stay aligned at any panel size),
                       containing the animated gradient band (bbgl-cap-sweep). overflow:hidden is a
                       reliably GPU-composited clip, unlike SVG clip-path, so the animation itself
                       is now genuinely compositor-only. */
                    .bbgl-cap-overlay {
                        position: absolute;
                        inset: 0;
                        pointer-events: none;
                    }

                    .bbgl-cap-win {
                        border-radius: 3% / 13%;
                        position: absolute;
                        overflow: hidden;
                    }

                    .bbgl-cap-sweep {
                        position: absolute;
                        inset: 0;
                        opacity: 0;
                    }

                    /* Only animate while the row is actually being looked at — hover intent, the
                       currently-viewed week, or touch-scrubbed. At rest the sweep is an inert,
                       non-animating opacity:0 div with no layer of its own, which keeps dozens of idle
                       sweep layers out of every frame the compositor draws. The layer is only built when
                       a row becomes active; with hover intent gating that, it no longer happens for every
                       row the mouse merely crosses. */
                    .bbgl-weekly-track.is-hover-intent .bbgl-cap-sweep,
                    .bbgl-weekly-track.is-viewing .bbgl-cap-sweep,
                    .bbgl-weekly-track.is-scrub-hovered .bbgl-cap-sweep {
                        will-change: transform, opacity;
                    }

                    /* Two one-way local passes per capsule (see CAP_WIN_DELAY_FWD_S/BWD_S in
                       buildCapsuleBar) instead of one capsule-local bounce — that's what makes the
                       whole bar read as one band traveling to the far end and back, rather than
                       each capsule bouncing on its own. */
                    .bbgl-weekly-track.is-hover-intent .bbgl-cap-sweep-pass-fwd,
                    .bbgl-weekly-track.is-viewing .bbgl-cap-sweep-pass-fwd,
                    .bbgl-weekly-track.is-scrub-hovered .bbgl-cap-sweep-pass-fwd {
                        animation: bbgl-cap-sweep-move-fwd-kf 4s cubic-bezier(.3, 0, .7, 1) infinite,
                                   bbgl-cap-sweep-fade-pass-kf 4s linear infinite;
                    }

                    .bbgl-weekly-track.is-hover-intent .bbgl-cap-sweep-pass-bwd,
                    .bbgl-weekly-track.is-viewing .bbgl-cap-sweep-pass-bwd,
                    .bbgl-weekly-track.is-scrub-hovered .bbgl-cap-sweep-pass-bwd {
                        animation: bbgl-cap-sweep-move-bwd-kf 4s cubic-bezier(.3, 0, .7, 1) infinite,
                                   bbgl-cap-sweep-fade-pass-kf 4s linear infinite;
                    }

                    /* Wide pure-white plateau at the core (not just a point) flanked by near-white,
                       fading through the tier's own hue at the edges — a bigger, bolder flash.
                       Still a static background, so only transform/opacity animate and the
                       compositor-only behavior from earlier is unaffected. */
                    .bbgl-cap-sweep-green {
                        background: linear-gradient(90deg, transparent 0%, rgba(95,255,20,.45) 12%, rgba(169,255,92,.9) 28%, #f1ffdf 42%, #ffffff 48%, #ffffff 52%, #f1ffdf 58%, rgba(169,255,92,.9) 72%, rgba(95,255,20,.45) 88%, transparent 100%);
                    }

                    .bbgl-cap-sweep-gold {
                        background: linear-gradient(90deg, transparent 0%, rgba(255,175,20,.45) 12%, rgba(255,217,94,.9) 28%, #fff4d2 42%, #ffffff 48%, #ffffff 52%, #fff4d2 58%, rgba(255,217,94,.9) 72%, rgba(255,175,20,.45) 88%, transparent 100%);
                    }

                    .bbgl-cap-sweep-diamond {
                        background: linear-gradient(90deg, transparent 0%, rgba(185,145,255,.45) 12%, rgba(221,203,255,.9) 28%, #eefff9 42%, #ffffff 48%, #ffffff 52%, #eefff9 58%, rgba(171,230,255,.9) 72%, rgba(120,220,235,.45) 88%, transparent 100%);
                    }

                    /* Outbound leg, left-to-right (see .bbgl-cap-sweep-pass-fwd above). */
                    @keyframes bbgl-cap-sweep-move-fwd-kf {
                        0% {
                            transform: translateX(-100%)
                        }

                        15%, 100% {
                            transform: translateX(100%)
                        }
                    }

                    /* Return leg — runs in reverse order (rightmost capsule first) and only starts
                       once every capsule's forward pass has finished, so the band appears to
                       arrive at the right edge before heading back. */
                    @keyframes bbgl-cap-sweep-move-bwd-kf {
                        0% {
                            transform: translateX(100%)
                        }

                        15%, 100% {
                            transform: translateX(-100%)
                        }
                    }

                    /* Shared fade shape for both legs — fade in, a real sustained plateau at full
                       brightness (not just a fleeting peak), fade out, then invisible for the rest
                       of that leg's own idle stretch. */
                    @keyframes bbgl-cap-sweep-fade-pass-kf {
                        0%, 15%, 100% {
                            opacity: 0
                        }

                        3.75%, 11.25% {
                            opacity: 1
                        }
                    }

                    #bbgl-panel.bbgl-no-animations .bbgl-cap-sweep {
                        animation: none;
                        opacity: 0;
                    }

                    #bbgl-panel.bbgl-no-rates .g-pill[data-val="rates"] {
                        display: none;
                    }

                    #bbgl-panel.bbgl-no-rates .c-gain.cell-stack,
                    #bbgl-panel.bbgl-no-rates .c-gain {
                        justify-content: center;
                    }

                    #bbgl-panel.bbgl-no-rates .c-gain .l-bot {
                        min-height: 0;
                    }

                    .bbgl-cap-svg {
                        display: block;
                        width: 100%;
                        height: 100%;
                    }

                    /* ─── Weekly Bar Handle ─────────────────────────────────── */
                    .bbgl-bar-handle {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: var(--bbgl-tab-w);
                        height: 24px;
                        z-index: 110;
                        pointer-events: auto;
                        cursor: pointer;
                        border-radius: 5px 5px 0 0;
                        box-sizing: border-box;
                        padding: 3px 5px 3px;
                        background-color: #202020;
                        background-image: linear-gradient(180deg, #202020 0%, #363636 40%, #404040 50%, #363636 60%, #181818 100%);
                        background-size: 100% var(--bbgl-track-h);
                        background-position: bottom center;
                        background-repeat: no-repeat;
                        /* 3D edge highlights on raised tab — no right-edge shadow to avoid junction seam */
                        box-shadow: inset 0 1px 0 rgba(255,255,255,.22), inset 1px 0 0 rgba(255,255,255,.14);
                        transition: height .2s cubic-bezier(.18, .89, .32, 1.28), box-shadow .15s ease;
                    }

                    .bbgl-summary-inset {
                        position: relative;
                        width: 100%;
                        height: 100%;
                        box-sizing: border-box;
                        padding: 1px;
                        border-radius: 3px;
                        background: linear-gradient(180deg, rgba(0,0,0,.32), rgba(0,0,0,.1) 45%, rgba(0,0,0,.22));
                        box-shadow: inset 0 1px 2px rgba(0,0,0,.75), inset 1px 0 1px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.22);
                        pointer-events: none;
                        transition: padding .2s cubic-bezier(.18, .89, .32, 1.28);
                    }

                    /* Inactive tab: the chart's bars only span y 2.5-23.5 and x 0.5-24 of its 24×24
                       viewBox, so they're scaled up around that ink box's centre (51% 54.17%) to fill
                       most of the inset — 24/21 would fill it exactly; 1.1 leaves a sliver. The active
                       tab is tall enough as-is and resets both below. */
                    .bbgl-bar-handle svg {
                        display: block;
                        width: 100%;
                        height: 100%;
                        overflow: visible;
                        transform-origin: 51% 54.17%;
                        transform: scale(1.1);
                        transition: transform .2s cubic-bezier(.18, .89, .32, 1.28);
                    }

                    body:not(.is-touch-device) .bbgl-weekly-track.is-hover-intent ~ .bbgl-bar-handle .bbgl-summary-inset,
                    .bbgl-weekly-track.is-scrub-hovered ~ .bbgl-bar-handle .bbgl-summary-inset,
                    .bbgl-weekly-track.is-viewing ~ .bbgl-bar-handle .bbgl-summary-inset {
                        padding: 2px;
                    }

                    body:not(.is-touch-device) .bbgl-weekly-track.is-hover-intent ~ .bbgl-bar-handle svg,
                    .bbgl-weekly-track.is-scrub-hovered ~ .bbgl-bar-handle svg,
                    .bbgl-weekly-track.is-viewing ~ .bbgl-bar-handle svg {
                        transform: none;
                    }

                    #bbgl-panel.bbgl-no-animations .bbgl-summary-inset,
                    #bbgl-panel.bbgl-no-animations .bbgl-bar-handle svg {
                        transition: none;
                    }

                    /* Compact: shorter tab */
                    #bbgl-panel.bbgl-compact .bbgl-bar-handle {
                        height: 20px;
                        padding: 2px 4px 2px;
                    }

                    /* Expanded: clamp height with panel width */
                    #bbgl-panel.bbgl-expanded .bbgl-bar-handle {
                        height: clamp(20px, calc(20px + 4px * var(--bbgl-dock-t)), 24px);
                    }

                    /* Page mode: clamp height with --bbgl-page-t */
                    #bbgl-panel.bbgl-mode-page .bbgl-bar-handle {
                        height: clamp(22px, calc(22px + 4px * var(--bbgl-page-t)), 26px);
                    }

                    body:not(.is-touch-device) .bbgl-weekly-track.is-hover-intent ~ .bbgl-bar-handle,
                    .bbgl-weekly-track.is-scrub-hovered ~ .bbgl-bar-handle,
                    .bbgl-weekly-track.is-viewing ~ .bbgl-bar-handle,
                    body:not(.is-touch-device) .bbgl-weekly-track.is-hover-intent ~ .bbgl-bar-handle {
                        height: 32px;
                        --bbgl-handle-active-h: 32px;
                        box-shadow: inset 0 1px 0 rgba(255,255,255,.38), inset 1px 0 0 rgba(255,255,255,.25);
                    }

                    body:not(.is-touch-device) .bbgl-weekly-track.is-hover-intent ~ .bbgl-bar-handle::before,
                    .bbgl-weekly-track.is-scrub-hovered ~ .bbgl-bar-handle::before,
                    .bbgl-weekly-track.is-viewing ~ .bbgl-bar-handle::before,
                    body:not(.is-touch-device) .bbgl-weekly-track.is-hover-intent ~ .bbgl-bar-handle::before {
                        opacity: 1;
                    }

                    .bbgl-bar-handle::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 100%;
                        border-radius: 5px 5px 0 0;
                        background: radial-gradient(circle at top left, rgba(255,255,255,.25) 0%, transparent 70%);
                        box-shadow: none;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity .15s ease;
                    }

                    body:not(.is-touch-device) #bbgl-panel.bbgl-compact .bbgl-weekly-track.is-hover-intent ~ .bbgl-bar-handle,
                    #bbgl-panel.bbgl-compact .bbgl-weekly-track.is-scrub-hovered ~ .bbgl-bar-handle,
                    #bbgl-panel.bbgl-compact .bbgl-weekly-track.is-viewing ~ .bbgl-bar-handle,
                    body:not(.is-touch-device) #bbgl-panel.bbgl-compact .bbgl-weekly-track.is-hover-intent ~ .bbgl-bar-handle {
                        /* 28px-wide tab leaves a 16px-wide chart (4px tab + 2px inset padding per side);
                           24px tall is the shortest that still fits it square, so the chart keeps its size. */
                        height: 24px;
                        --bbgl-handle-active-h: 24px;
                    }

                    body:not(.is-touch-device) #bbgl-panel.bbgl-expanded .bbgl-weekly-track.is-hover-intent ~ .bbgl-bar-handle,
                    #bbgl-panel.bbgl-expanded .bbgl-weekly-track.is-scrub-hovered ~ .bbgl-bar-handle,
                    #bbgl-panel.bbgl-expanded .bbgl-weekly-track.is-viewing ~ .bbgl-bar-handle,
                    body:not(.is-touch-device) #bbgl-panel.bbgl-expanded .bbgl-weekly-track.is-hover-intent ~ .bbgl-bar-handle {
                        height: clamp(26px, calc(26px + 6px * var(--bbgl-dock-t)), 32px);
                        --bbgl-handle-active-h: clamp(26px, calc(26px + 6px * var(--bbgl-dock-t)), 32px);
                    }

                    body:not(.is-touch-device) #bbgl-panel.bbgl-mode-page .bbgl-weekly-track.is-hover-intent ~ .bbgl-bar-handle,
                    #bbgl-panel.bbgl-mode-page .bbgl-weekly-track.is-scrub-hovered ~ .bbgl-bar-handle,
                    #bbgl-panel.bbgl-mode-page .bbgl-weekly-track.is-viewing ~ .bbgl-bar-handle,
                    body:not(.is-touch-device) #bbgl-panel.bbgl-mode-page .bbgl-weekly-track.is-hover-intent ~ .bbgl-bar-handle {
                        height: clamp(30px, calc(30px + 6px * var(--bbgl-page-t)), 36px);
                        --bbgl-handle-active-h: clamp(30px, calc(30px + 6px * var(--bbgl-page-t)), 36px);
                    }

                    #bbgl-panel.bbgl-no-animations .bbgl-bar-handle {
                        transition: none;
                    }

                    /* ─── Level EXP Bar — Structural ────────────────────── */
                    #bbgl-level-container {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 18px;
                        /* Track height for this mode, shared by the flag-clip cut line and the
                           A2 diamond's bottom anchor so they stay in sync. Overridden per mode. */
                        --bbgl-track-h: 9px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: flex-end;
                        pointer-events: none;
                        z-index: 10;
                        /* Own layer: this full-width bar paints after the whole title group and overlaps
                           the month row's chart-button glow, so every header button hover regrouped and
                           repainted it — badge, crown and level number included. */
                        will-change: transform;
                    }

                    /* Sibling of #bbgl-level-container, painted behind it, holding the housing
                       SVG. Never clipped. */
                    #bbgl-level-bg {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 9px;
                        pointer-events: none;
                        will-change: transform; /* same reason as #bbgl-level-container */
                    }

                    /* Wraps the tucking badge — both the text flag (#bbgl-level-num) and, for
                       A2, the diamond crown (::before). A normal, non-transformed flex item
                       whose bottom edge sits at the top of the bar (track height above the
                       container bottom). The NEGATIVE clip bottom-inset pushes the cut line
                       DOWN from there to about halfway into the bar, so the badge rests fully
                       visible on top of the bar and only gets sliced once it has tucked down
                       past the midpoint. Left/right insets are opened up (-9999px) so the wide
                       diamond isn't clipped on its sides — only the bottom cut matters. Because
                       this wrapper never transforms, that cut line is screen-fixed: the badge
                       translateY()s through it during the crown-tuck/rise animation, instead of
                       the clip boundary sliding along with the badge (which is what happens if
                       the clip is on the transformed badge itself). */
                    #bbgl-level-flag-clip {
                        position: relative;
                        z-index: 3;
                        flex-shrink: 0;
                        clip-path: inset(-9999px -9999px calc(var(--bbgl-track-h) * -0.5) -9999px);
                        /* #bbgl-level-container (panel version) is pointer-events:none since it's
                           an absolute overlay that shouldn't block calendar clicks underneath it —
                           re-enable it here so the level tooltip is still hoverable/tappable. */
                        pointer-events: auto;
                    }

                    /* Single shared rule for every atrophy-tier badge graphic (A0 crown, A2
                       diamond, ...) instead of setting pointer-events on each tier's own ::before
                       block individually — whichever one is actually generated (content: '' set
                       by its own [data-atrophy="N"]-scoped rule) picks this up. */
                    #bbgl-level-flag-clip::before,
                    #bbgl-gym-level-container::before {
                        pointer-events: auto;
                    }

                    #bbgl-level-num {
                        font-family: 'Aldrich', 'Fjalla One', 'Arial Narrow', sans-serif;
                        font-size: clamp(7px, 1.8cqi, 10px);
                        font-weight: 700;
                        letter-spacing: 0.5px;
                        line-height: 1;
                        white-space: nowrap;
                        position: relative;
                        display: block;
                        transform-origin: bottom center;
                    }

                    #bbgl-panel.bbgl-compact #bbgl-level-num .bbgl-lv-prefix,
                    #bbgl-gym-level-num .bbgl-lv-prefix {
                        display: none;
                    }

                    #bbgl-level-track,
                    #bbgl-gym-level-track {
                        position: relative;
                        z-index: 2;
                        width: 100%;
                        height: 9px;
                        flex-shrink: 0;
                        border-radius: 0;
                        overflow: hidden;
                        background: none;
                        box-shadow: none;
                        pointer-events: auto;
                    }

                    #bbgl-level-bg,
                    #bbgl-gym-level-track {
                        background: repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(255,255,255,.012) 1px, rgba(255,255,255,.012) 2px), linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%);
                    }

                    #bbgl-level-fill,
                    #bbgl-gym-level-fill {
                        position: absolute;
                        top: 13%;
                        left: 1.6%;
                        height: 74%;
                        width: 0%;
                        z-index: 2;
                        border-radius: 3px / 50%;
                        transition: width .8s cubic-bezier(.25, 1, .5, 1);
                        will-change: width;
                    }

                    #bbgl-level-fill::after,
                    #bbgl-gym-level-fill::after {
                        content: '';
                        position: absolute;
                        inset: 0;
                        border-radius: inherit;
                        pointer-events: none;
                        background: linear-gradient(180deg, rgba(0,0,0,.28), rgba(255,255,255,.25) 22%, transparent 42%, rgba(0,0,0,.16) 74%, rgba(255,255,255,.12) 88%, rgba(0,0,0,.32));
                        box-shadow: inset 0 1px 0 rgba(255,255,255,.28), inset -1px 0 1px rgba(255,255,255,.45), 1px 0 2px rgba(0,0,0,.7), 0 1px 1px rgba(0,0,0,.65);
                    }

                    @keyframes bbgl-lvl-flash-dmnd {
                        0% { filter: brightness(1) drop-shadow(0 0 0 rgba(255,255,255,0)); transform: translateX(-50%) scale(1); }
                        20% { filter: brightness(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.4)); transform: translateX(-50%) scale(1.15); }
                        100% { filter: brightness(1) drop-shadow(0 0 0 rgba(255,255,255,0)); transform: translateX(-50%) scale(1); }
                    }

                    @keyframes bbgl-lvl-flash-text {
                        0% { transform: scale(1); }
                        20% { color: #ffffff; text-shadow: 0 0 10px #ffffff, 0 0 20px #ffffff, 0 0 30px #ffffff, 0 0 40px #66ff33, 0 0 60px #66ff33; transform: scale(1.4); }
                        100% { transform: scale(1); }
                    }

                    @keyframes bbgl-lvl-flash-bar {
                        0% { filter: brightness(1); }
                        20% { filter: brightness(1.8); }
                        100% { filter: brightness(1); }
                    }

                    @keyframes bbgl-lvl-flash-track {
                        0%   { filter: none; }
                        20%  { filter: brightness(1.3) drop-shadow(0 0 10px rgba(217, 160, 255, 1)) drop-shadow(0 0 22px rgba(180, 100, 255, 0.6)); }
                        100% { filter: none; }
                    }

                    @keyframes bbgl-lvl-flash-track-a0 {
                        0%   { filter: none; }
                        20%  { filter: brightness(1.3) drop-shadow(0 0 10px rgba(100, 255, 60, 1)) drop-shadow(0 0 22px rgba(60, 200, 20, 0.6)); }
                        100% { filter: none; }
                    }

                    @keyframes bbgl-lvl-flash-track-a0-white {
                        0%   { filter: none; }
                        20%  { filter: brightness(1.5) drop-shadow(0 0 12px rgba(255, 255, 255, 1)) drop-shadow(0 0 24px rgba(255, 255, 255, 0.8)); }
                        100% { filter: none; }
                    }

                    @keyframes bbgl-lvl-flash-text-white {
                        0% { transform: scale(1); }
                        20% { color: #ffffff; text-shadow: 0 0 10px #ffffff, 0 0 20px #ffffff, 0 0 30px #ffffff, 0 0 40px #cccccc, 0 0 60px #cccccc; transform: scale(1.4); }
                        100% { transform: scale(1); }
                    }

                    /* ─── Atrophy Tier-Complete Sequence ────────────────────
                       Crown tucks away (mole-in-hole pop), the next tier's crown rises
                       into place (podium reveal + spotlight), then "Atrophied!" flashes. */
                    /* No opacity fade here on purpose — the container's clip-path (see
                       #bbgl-level-container) gives a hard cutoff at the bottom of the exp bar
                       as the flag translates past it, so it reads as sliding behind an edge
                       rather than fading out. */
                    @keyframes bbgl-crown-tuck-kf {
                        0%   { transform: translateX(-50%) translateY(0); }
                        35%  { transform: translateX(-50%) translateY(-16%); }
                        100% { transform: translateX(-50%) translateY(130%); }
                    }

                    @keyframes bbgl-crown-rise-kf {
                        0%   { transform: translateX(-50%) translateY(130%); filter: brightness(1) drop-shadow(0 0 0 rgba(255,255,255,0)); }
                        70%  { transform: translateX(-50%) translateY(-8%); filter: brightness(1.7) drop-shadow(0 0 14px rgba(255,255,255,0.7)); }
                        100% { transform: translateX(-50%) translateY(0); filter: brightness(1) drop-shadow(0 0 0 rgba(255,255,255,0)); }
                    }

                    /* Same tuck/rise motion, for the current text-badge flags (A0/A1) which are
                       real DOM elements (not the ::before image slot), so no translateX(-50%)
                       centering hack is needed — they're already centered via flexbox. */
                    @keyframes bbgl-flag-tuck-kf {
                        0%   { transform: translateY(0); }
                        35%  { transform: translateY(-16%); }
                        100% { transform: translateY(130%); }
                    }

                    @keyframes bbgl-flag-rise-kf {
                        0%   { transform: translateY(130%); filter: brightness(1) drop-shadow(0 0 0 rgba(255,255,255,0)); }
                        70%  { transform: translateY(-8%); filter: brightness(1.7) drop-shadow(0 0 14px rgba(255,255,255,0.7)); }
                        100% { transform: translateY(0); filter: brightness(1) drop-shadow(0 0 0 rgba(255,255,255,0)); }
                    }

                    @keyframes bbgl-atrophied-flash-kf {
                        0%   { opacity: 0; transform: translateX(-50%) scale(0.6); }
                        30%  { opacity: 1; transform: translateX(-50%) scale(1.15); }
                        55%  { opacity: 1; transform: translateX(-50%) scale(1); }
                        85%  { opacity: 1; }
                        100% { opacity: 0; transform: translateX(-50%) scale(1); }
                    }

                    /* The container (flag + track + fill) sits at z-index:10, above
                       .bbgl-grid-container (auto/0), so it always paints in front of the
                       calendar. To let the flag actually dip *behind* the calendar rather than
                       just sliding down over it, drop the whole container below the grid for the
                       middle of the tuck/rise motion, then restore it once the flag is settled
                       (or mid-reveal for the rise) so the bar and the "Atrophied!" flash still
                       read in front as normal. */
                    @keyframes bbgl-tier-tuck-z-kf {
                        0%   { z-index: 10; }
                        35%  { z-index: 10; }
                        36%  { z-index: 0; }
                        100% { z-index: 0; }
                    }

                    @keyframes bbgl-tier-rise-z-kf {
                        0%   { z-index: 0; }
                        69%  { z-index: 0; }
                        70%  { z-index: 10; }
                        100% { z-index: 10; }
                    }

                    .bbgl-crown-tuck {
                        animation: bbgl-tier-tuck-z-kf 0.35s steps(1, end) forwards;
                    }

                    .bbgl-crown-rise {
                        animation: bbgl-tier-rise-z-kf 0.9s steps(1, end) forwards;
                    }

                    /* Diamond tuck/rise. The tuck class is on the container; gym's diamond is
                       the container's own ::before, main panel's is the flag-clip wrapper's
                       ::before, so both are targeted. */
                    .bbgl-crown-tuck::before,
                    .bbgl-crown-tuck #bbgl-level-flag-clip::before {
                        animation: bbgl-crown-tuck-kf 0.35s ease-in-out forwards;
                    }

                    .bbgl-crown-rise::before,
                    .bbgl-crown-rise #bbgl-level-flag-clip::before {
                        animation: bbgl-crown-rise-kf 0.9s ease-out forwards;
                    }

                    .bbgl-crown-tuck #bbgl-level-num,
                    .bbgl-crown-tuck #bbgl-gym-level-num {
                        animation: bbgl-flag-tuck-kf 0.35s ease-in-out forwards;
                    }

                    .bbgl-crown-rise #bbgl-level-num,
                    .bbgl-crown-rise #bbgl-gym-level-num {
                        animation: bbgl-flag-rise-kf 0.9s ease-out forwards;
                    }

                    .bbgl-atrophied-flash::after {
                        content: 'Atrophied!';
                        position: absolute;
                        bottom: calc(100% + 4px);
                        left: 50%;
                        white-space: nowrap;
                        pointer-events: none;
                        z-index: 4;
                        font-family: 'Fjalla One', 'Arial Narrow', sans-serif;
                        font-weight: 800;
                        font-size: clamp(11px, calc(11px + 5px * var(--bbgl-dock-t, 0)), 16px);
                        letter-spacing: 0.5px;
                        color: #fff;
                        text-shadow: 0 0 6px #ffee66, 0 0 14px #ffcc00, 0 0 24px #ff8800;
                        animation: bbgl-atrophied-flash-kf 0.7s ease-out forwards;
                    }

                    .bbgl-level-up-flash::before,
                    .bbgl-level-up-flash #bbgl-level-flag-clip::before {
                        animation: bbgl-lvl-flash-dmnd 0.8s ease-out;
                    }

                    .bbgl-level-up-flash #bbgl-level-num {
                        animation: bbgl-lvl-flash-text 0.8s ease-out;
                    }

                    .bbgl-level-up-flash #bbgl-level-fill {
                        animation: bbgl-lvl-flash-bar 0.8s ease-out;
                    }

                    .bbgl-level-up-flash #bbgl-level-track,
                    .bbgl-level-up-flash #bbgl-gym-level-track {
                        animation: bbgl-lvl-flash-track 0.8s ease-out;
                    }

                    #bbgl-panel.bbgl-expanded #bbgl-level-container {
                        height: 22px;
                        --bbgl-track-h: 14px;
                    }

                    #bbgl-panel.bbgl-expanded #bbgl-level-bg,
                    #bbgl-panel.bbgl-expanded #bbgl-level-track {
                        height: 14px;
                    }

                    #bbgl-panel.bbgl-expanded #bbgl-level-num {
                        font-size: clamp(9px, calc(9px + 2px * var(--bbgl-dock-t)), 11px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-level-container {
                        height: clamp(18px, calc(18px + 8px * var(--bbgl-page-t)), 26px);
                        --bbgl-track-h: clamp(8px, calc(8px + 6px * var(--bbgl-page-t)), 14px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-level-bg,
                    #bbgl-panel.bbgl-mode-page #bbgl-level-track {
                        height: clamp(8px, calc(8px + 6px * var(--bbgl-page-t)), 14px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-level-num {
                        font-size: clamp(6px, calc(6px + 6px * var(--bbgl-page-t)), 12px);
                    }

                    /* ─── Gym Page Level Bar — Structural ───────────────── */
                    #bbgl-gym-level-container {
                        position: relative;
                        width: 100%;
                        margin-top: 30px;
                        margin-bottom: 2px;
                        --bbgl-track-h: 12px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        container-type: inline-size;
                        clip-path: inset(-9999px 0 0 0);
                    }

                    /* Scoped override: the shared #bbgl-level-track / #bbgl-gym-level-track rule
                       hardcodes 9px so the main panel bar is unaffected; the gym page bar tracks
                       --bbgl-track-h so it stays in sync with the crown's anchor position above. */
                    #bbgl-gym-level-track {
                        height: var(--bbgl-track-h);
                    }

                    #bbgl-gym-level-num {
                        font-family: 'Aldrich', 'Fjalla One', 'Arial Narrow', sans-serif;
                        font-size: clamp(6.5px, 1.0cqi, 8.5px);
                        font-weight: 700;
                        letter-spacing: 0.5px;
                        line-height: 1;
                        white-space: nowrap;
                        position: relative;
                        z-index: 3;
                    }



                    .bbgl-level-up-flash #bbgl-gym-level-num {
                        animation: bbgl-lvl-flash-text 0.8s ease-out;
                    }

                    .bbgl-level-up-flash #bbgl-gym-level-fill {
                        animation: bbgl-lvl-flash-bar 0.8s ease-out;
                    }

                    /* ─── Level Bar — A1 flag: structure ──────────
                       --f-bdr (border), --f-bg-top/--f-bg (background gradient),
                       --f-hi (inner highlight) are supplied by the A1 palette below. */
                    #bbgl-panel[data-atrophy="1"] #bbgl-level-num {
                        --f-r: clamp(5px, calc(5px + 3px * var(--bbgl-dock-t, 0)), 8px);
                        padding: 3px clamp(8px, calc(8px + 6px * var(--bbgl-dock-t, 0)), 14px);
                        border-top: 1px solid var(--f-bdr);
                        border-left: none;
                        border-right: none;
                        border-bottom: none;
                        border-radius: 5px 5px 0 0;
                        background: linear-gradient(180deg, var(--f-bg-top) 0%, var(--f-bg) 100%);
                        backdrop-filter: blur(4px);
                        -webkit-backdrop-filter: blur(4px);
                        box-shadow: inset 0 1px 1px var(--f-hi), 0 -1px 3px rgba(0, 0, 0, 0.4);
                        margin-bottom: -1px;
                        z-index: 1;
                    }

                    #bbgl-gym-level-container[data-atrophy="1"] #bbgl-gym-level-num {
                        --f-r: clamp(5px, 1.3cqi, 8px);
                        padding: 3px clamp(8px, 2cqi, 14px);
                        border-top: 1px solid var(--f-bdr);
                        border-left: none;
                        border-right: none;
                        border-bottom: none;
                        border-radius: 5px 5px 0 0;
                        background: linear-gradient(180deg, var(--f-bg-top) 0%, var(--f-bg) 100%);
                        backdrop-filter: blur(4px);
                        -webkit-backdrop-filter: blur(4px);
                        box-shadow: inset 0 1px 1px var(--f-hi), 0 -1px 3px rgba(0, 0, 0, 0.4);
                        margin-bottom: -1px;
                        z-index: 1;
                    }

                    /* Rounded corner flares at the flag's feet (A1). */
                    #bbgl-panel[data-atrophy="1"] #bbgl-level-num::before,
                    #bbgl-gym-level-container[data-atrophy="1"] #bbgl-gym-level-num::before {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: calc(-1 * var(--f-r) + 1px);
                        right: calc(-1 * var(--f-r) + 1px);
                        height: var(--f-r);
                        z-index: -1;
                        pointer-events: none;
                        --f-r-in: calc(var(--f-r) - 1px);
                        background:
                            radial-gradient(circle at 0 0, transparent var(--f-r-in), var(--f-bdr) var(--f-r-in), var(--f-bdr) var(--f-r), var(--f-bg) var(--f-r)) left bottom / var(--f-r) var(--f-r) no-repeat,
                            radial-gradient(circle at 100% 0, transparent var(--f-r-in), var(--f-bdr) var(--f-r-in), var(--f-bdr) var(--f-r), var(--f-bg) var(--f-r)) right bottom / var(--f-r) var(--f-r) no-repeat;
                    }

                    /* ─── Level Bar — A0: Crown badge (script logo) ─────────
                       Same icon-badge treatment as A2's diamond: the crown sits behind the
                       bar via a ::before background-image, "Lv X" floats above it as plain
                       text (no flag box). */
                    #bbgl-panel[data-atrophy="0"] #bbgl-level-container {
                        --crwn-s: clamp(30px, 8cqi, 38px);
                    }

                    #bbgl-gym-level-container[data-atrophy="0"] {
                        --crwn-s: clamp(30px, 7.5cqi, 34px);
                    }

                    #bbgl-panel[data-atrophy="0"].bbgl-expanded #bbgl-level-container {
                        --crwn-s: clamp(42px, calc(42px + 10px * var(--bbgl-dock-t)), 52px);
                    }

                    #bbgl-panel[data-atrophy="0"].bbgl-mode-page #bbgl-level-container {
                        --crwn-s: calc(clamp(30px, 8cqi, 38px) + 18px * var(--bbgl-page-t));
                    }

                    /* Main panel crown — lives on the flag-clip wrapper. The wrapper's own
                       bottom edge already sits at the top of the bar (see the flag-clip
                       comment above), so bottom:0 here lands the crown's bottom edge flush
                       with the top of the track — no overlap into the bar. */
                    #bbgl-panel[data-atrophy="0"] #bbgl-level-flag-clip::before {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 50%;
                        transform-origin: 50% 100%;
                        transform: translateX(-50%);
                        width: calc(var(--crwn-s) * 1.3);
                        height: calc(var(--crwn-s) * 0.85 + 1px);
                        background: url("${CROWN_BADGE_URL}") center bottom / 100% 100% no-repeat;
                        z-index: -1;
                    }

                    /* Gym page crown — old structure (no flag-clip wrapper): the container's
                       own bottom edge is the bottom of the track, so the top of the track sits
                       --bbgl-track-h above it. Same flush, no-overlap placement as the main
                       panel version. */
                    #bbgl-gym-level-container[data-atrophy="0"]::before {
                        content: '';
                        position: absolute;
                        bottom: var(--bbgl-track-h);
                        left: 50%;
                        transform-origin: 50% 100%;
                        transform: translateX(-50%);
                        width: calc(var(--crwn-s) * 1.3);
                        height: calc(var(--crwn-s) * 0.85 + 1px);
                        background: url("${CROWN_BADGE_URL}") center bottom / 100% 100% no-repeat;
                        z-index: 1;
                    }

                    #bbgl-panel[data-atrophy="0"] #bbgl-level-num,
                    #bbgl-gym-level-container[data-atrophy="0"] #bbgl-gym-level-num {
                        color: #f0f0f0;
                        text-shadow: 0 0 1px #000, 0 0 2px #000, 0 0 3px rgba(0,0,0,0.8);
                        margin-bottom: 1px;
                        transform: scaleX(1.15);
                    }

                    #bbgl-panel[data-atrophy="0"].bbgl-expanded #bbgl-level-num {
                        margin-bottom: 2px;
                    }

                    #bbgl-panel[data-atrophy="0"].bbgl-mode-page #bbgl-level-num {
                        margin-bottom: clamp(1px, calc(1px + 1px * var(--bbgl-page-t)), 2px);
                    }

                    /* ─── Level Bar — A1: Green palette ──────── */
                    #bbgl-panel[data-atrophy="1"] #bbgl-level-num,
                    #bbgl-gym-level-container[data-atrophy="1"] #bbgl-gym-level-num {
                        color: #b3ffb3;
                        text-shadow: 0 0 2px #33cc00, 0 0 6px #199900, 0 0 12px #199900;
                        --f-bdr: rgba(30, 80, 10, 0.7);
                        --f-bg-top: rgba(20, 60, 5, 0.75);
                        --f-bg: rgba(5, 20, 0, 0.9);
                        --f-hi: rgba(150, 255, 100, 0.15);
                    }

                    #bbgl-panel[data-atrophy="0"] #bbgl-level-track,
                    #bbgl-gym-level-container[data-atrophy="0"] #bbgl-gym-level-track {
                        backdrop-filter: none;
                        -webkit-backdrop-filter: none;
                    }

                    /* Suppress backdrop-filter while the compact<->expanded resize is animating: blurring
                       what's behind this element has to be resampled every frame the panel's layer changes,
                       which is one of the more GPU-expensive things to animate. Restored once settled. */
                    #bbgl-panel.bbgl-resizing #bbgl-level-num {
                        backdrop-filter: none !important;
                        -webkit-backdrop-filter: none !important;
                    }

                    #bbgl-panel[data-atrophy="0"] #bbgl-level-fill,
                    #bbgl-gym-level-container[data-atrophy="0"] #bbgl-gym-level-fill {
                        background:
                            linear-gradient(112deg, transparent 5%, #ffffff30 17%, #11182030 24%, transparent 32%, #ffffff45 49%, transparent 56%, #10182035 71%, #ffffff30 85%, transparent 94%),
                            linear-gradient(180deg, #252e32 0%, #818c90 16%, #edf1ee 32%, #b9c3c4 44%, #626e74 55%, #97a4a6 73%, #d4dcda 86%, #394447 100%);
                        box-shadow: inset 0 1px 0 #f0f5ef50, inset 0 -1px 0 #080e1280, inset 1px 0 2px #10182070;
                    }

                    #bbgl-panel[data-atrophy="1"] .bbgl-level-up-flash #bbgl-level-track,
                    #bbgl-gym-level-container[data-atrophy="1"].bbgl-level-up-flash #bbgl-gym-level-track {
                        animation: bbgl-lvl-flash-track-a0 0.8s ease-out;
                    }

                    #bbgl-panel[data-atrophy="0"] .bbgl-level-up-flash #bbgl-level-track,
                    #bbgl-gym-level-container[data-atrophy="0"].bbgl-level-up-flash #bbgl-gym-level-track {
                        animation: bbgl-lvl-flash-track-a0-white 0.8s ease-out;
                    }

                    #bbgl-panel[data-atrophy="0"] .bbgl-level-up-flash #bbgl-level-num,
                    #bbgl-gym-level-container[data-atrophy="0"].bbgl-level-up-flash #bbgl-gym-level-num {
                        animation: bbgl-lvl-flash-text-white 0.8s ease-out;
                    }

                    /* ─── Level Bar — A1: Green ──────────────────────────── */
                    #bbgl-panel[data-atrophy="1"] #bbgl-level-fill,
                    #bbgl-gym-level-container[data-atrophy="1"] #bbgl-gym-level-fill {
                        background:
                            repeating-linear-gradient(118deg, transparent 0 37px, #011e1850 38px 55px, #b2ffd626 56px 57px, transparent 58px 103px),
                            linear-gradient(72deg, #00291e40, transparent 24%, #8bffc333 41%, transparent 55%, #001e2045 79%, transparent),
                            linear-gradient(180deg, #04271f 0%, #096245 19%, #59c999 32%, #159867 45%, #07563f 58%, #0b925c 78%, #40b582 87%, #032b21 100%);
                        box-shadow: inset 0 1px 0 #bcffdc45, inset 0 -1px 0 #001b1680, inset 1px 0 2px #001b1670;
                    }

                    /* ─── Level Bar — A2: Diamond ───────────────────────── */
                    #bbgl-panel[data-atrophy="2"] #bbgl-level-container {
                        --dmnd-s: clamp(60px, 16cqi, 76px);
                        --dmnd-b: calc(var(--dmnd-s) * -0.25);
                    }

                    #bbgl-gym-level-container[data-atrophy="2"] {
                        --dmnd-s: clamp(76px, 12cqi, 90px);
                        --dmnd-b: calc(var(--dmnd-s) * -0.25);
                    }

                    #bbgl-panel[data-atrophy="2"].bbgl-expanded #bbgl-level-container {
                        --dmnd-s: clamp(70px, calc(70px + 18px * var(--bbgl-dock-t)), 88px);
                        --dmnd-b: calc(var(--dmnd-s) * -0.23);
                    }

                    #bbgl-panel[data-atrophy="2"].bbgl-mode-page #bbgl-level-container {
                        --dmnd-s: calc(clamp(60px, 16cqi, 76px) + 28px * var(--bbgl-page-t));
                        --dmnd-b: calc(var(--dmnd-s) * (-0.25 + 0.02 * var(--bbgl-page-t)));
                    }

                    /* A2 badge slot — main panel. Lives on the flag-clip wrapper so it shares the
                       wrapper's screen-fixed cut line and tucks behind the bar like the text
                       flag. Its offset parent (the wrapper) sits --bbgl-track-h above the
                       container bottom, so the bottom anchor subtracts that to land the badge
                       at the same spot the old container-relative anchor did. No self-clip — the
                       wrapper does the clipping. z-index:-1 keeps the number text in front.
                       No background image set — the diamond placeholder was pulled pending a
                       replacement A2 tier asset; set the background property here once one exists. */
                    #bbgl-panel[data-atrophy="2"] #bbgl-level-flag-clip::before {
                        content: '';
                        position: absolute;
                        bottom: calc(var(--dmnd-b) - var(--bbgl-track-h));
                        left: 50%;
                        transform-origin: 50% calc(100% + var(--dmnd-b));
                        transform: translateX(-50%);
                        width: var(--dmnd-s);
                        height: var(--dmnd-s);
                        z-index: -1;
                    }

                    /* A2 badge slot — gym page, old structure (no flag-clip wrapper), keeps its
                       own self-clip. No background image set; see main panel slot above. */
                    #bbgl-gym-level-container[data-atrophy="2"]::before {
                        content: '';
                        position: absolute;
                        bottom: var(--dmnd-b);
                        left: 50%;
                        transform-origin: 50% calc(100% + var(--dmnd-b));
                        transform: translateX(-50%);
                        width: var(--dmnd-s);
                        height: var(--dmnd-s);
                        clip-path: inset(0 0 calc(var(--dmnd-b) * -1 + 2px) 0);
                        z-index: 1;
                        pointer-events: none;
                    }

                    #bbgl-panel[data-atrophy="2"] #bbgl-level-num,
                    #bbgl-gym-level-container[data-atrophy="2"] #bbgl-gym-level-num {
                        color: #b3ffb3;
                        text-shadow: 0 0 2px #33cc00, 0 0 6px #199900, 0 0 12px #199900;
                        margin-bottom: 7px;
                    }

                    #bbgl-panel[data-atrophy="2"].bbgl-expanded #bbgl-level-num {
                        margin-bottom: 10px;
                    }

                    #bbgl-panel[data-atrophy="2"].bbgl-mode-page #bbgl-level-num {
                        margin-bottom: clamp(7px, calc(7px + 2px * var(--bbgl-page-t)), 9px);
                    }

                    #bbgl-panel[data-atrophy="2"] #bbgl-level-fill,
                    #bbgl-gym-level-container[data-atrophy="2"] #bbgl-gym-level-fill {
                        background:
                            linear-gradient(108deg, #69300c30 5%, transparent 17%, #fff0ad50 28%, transparent 34%, #6b35052e 55%, #fff4c43d 73%, transparent 81%),
                            repeating-linear-gradient(0deg, transparent 0 2px, #ffe8a30d 2px 3px),
                            linear-gradient(180deg, #4a2c10 0%, #b48229 18%, #ffe59a 33%, #e5b64a 45%, #9c651d 57%, #cb932f 72%, #efcc70 87%, #624019 100%);
                        box-shadow: inset 0 1px 0 #fff0b650, inset 0 -1px 0 #32150090, inset 1px 0 2px #32150070;
                    }

                    #bbgl-panel[data-atrophy="2"] #bbgl-level-fill.level-full,
                    #bbgl-gym-level-container[data-atrophy="2"] #bbgl-gym-level-fill.level-full {
                        box-shadow: inset 0 1px 0 #fff0b680, inset 0 -1px 0 #32150090, inset 0 0 3px #ffe9a145;
                    }

                    #bbgl-panel[data-atrophy="2"][data-level="100"] #bbgl-level-fill.level-full,
                    #bbgl-gym-level-container[data-atrophy="2"][data-level="100"] #bbgl-gym-level-fill.level-full {
                        background:
                            linear-gradient(180deg, #122133a0, #ffffff30 22%, #ffffff95 34%, transparent 47%, #24283e60 59%, #ffffff30 84%, #142337a0),
                            linear-gradient(112deg, #91c6d0 0%, #c5b0e3 16%, #e3b9d2 29%, #a9dbea 43%, #c5ebd7 57%, #e5dfb6 70%, #cbbce4 83%, #9ed8dd 100%);
                        box-shadow: inset 0 1px 0 #f4ffff80, inset 0 -1px 0 #19243e90, inset 1px 0 2px #182a3860;
                    }

                    /* ─────────────────────────────────────────────────────── */

                    /* ─── Endocrine Enhancers Page ──────────────────────── */

                    .bbgl-ach-section-energy .bbgl-ach-section-title {
                        border-bottom: none;
                    }

                    .bbgl-enh-mode-switch {
                        position: absolute;
                        right: 2px;
                        top: 50%;
                        transform: translateY(-50%);
                        display: flex;
                        align-items: center;
                        gap: 0;
                        z-index: 3;
                    }

                    .bbgl-enh-sw-opt {
                        font-family: var(--bbgl-ach-font);
                        font-size: 8px;
                        font-weight: 700;
                        letter-spacing: .06em;
                        text-transform: uppercase;
                        color: #bbb;
                        padding: 1px 5px;
                        cursor: pointer;
                        user-select: none;
                        border: 1px solid #6a6a6a;
                        line-height: 1.4;
                        transition: background .15s;
                        white-space: nowrap;
                    }

                    .bbgl-enh-sw-opt:first-child { border-radius: 3px 0 0 3px; border-right: none; }
                    .bbgl-enh-sw-opt:last-child  { border-radius: 0 3px 3px 0; }

                    .bbgl-enh-sw-opt.active,
                    body:not(.is-touch-device) .bbgl-enh-sw-opt:not(.active):hover {
                        background: rgba(255, 255, 255, 0.13);
                    }

                    body:not(.is-touch-device) .bbgl-ach-section-energy .bbgl-ach-title-row:has(.bbgl-enh-sw-opt:hover) .bbgl-ach-section-title {
                        color: #9a9a9a;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-enh-sw-opt {
                        font-size: clamp(8px, calc(8px + 1px * var(--bbgl-dock-t)), 9px);
                        padding: 2px 7px;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-enh-sw-opt {
                        font-size: clamp(6px, calc(6px + 4px * var(--bbgl-page-t)), 10px);
                        padding: 2px 7px;
                    }

                    .bbgl-ach-section-energy .bbgl-ach-row {
                        padding: var(--bbgl-ach-row-pad-v, 4px) 2px;
                        border-bottom: 1px solid rgba(255, 255, 255, .05);
                    }

                    .bbgl-ach-section-energy .bbgl-ach-row:last-of-type {
                        border-bottom: none;
                    }

                    .ach-enh-e-label {
                        color: #69f0ae;
                        font-weight: 600;
                    }

                    /* Shared stat colors — single source for every achievement context
                       (enhancer gains, row subscripts, grid headers, HH tags).

                       The titles page's own stat labels are deliberately NOT in this list: they're
                       neon signs now (.bbgl-title-block-label), and take a whitened tint of
                       --bbgl-t-win-color with the raw stat colour carried by their glow instead —
                       same white-core/coloured-bloom logic as the tubes they hang from. */
                    .ach-enh-gained .ach-stat-str,
                    .bbgl-ach-row .ach-sub.ach-stat-str,
                    .ach-stat-header.ach-stat-str,
                    .bbgl-ach-hh-tag.ach-stat-str { color: #3264c6; }

                    .ach-enh-gained .ach-stat-def,
                    .bbgl-ach-row .ach-sub.ach-stat-def,
                    .ach-stat-header.ach-stat-def,
                    .bbgl-ach-hh-tag.ach-stat-def { color: #dc3912; }

                    .ach-enh-gained .ach-stat-spd,
                    .bbgl-ach-row .ach-sub.ach-stat-spd,
                    .ach-stat-header.ach-stat-spd,
                    .bbgl-ach-hh-tag.ach-stat-spd { color: #ff9900; }

                    .ach-enh-gained .ach-stat-dex,
                    .bbgl-ach-row .ach-sub.ach-stat-dex,
                    .ach-stat-header.ach-stat-dex,
                    .bbgl-ach-hh-tag.ach-stat-dex { color: #109618; }

                    .bbgl-ach-row .ach-sub.ach-stat-tot,
                    .ach-stat-header.ach-stat-tot,
                    .bbgl-ach-stat-cell .ach-value.ach-stat-tot { color: #9d039d; }

                    /* HH total tag is deliberately neutral, not stat-purple. */
                    .bbgl-ach-hh-tag.ach-stat-tot { color: #999; }
                    .bbgl-ach-row.bbgl-ach-od-row .ach-k,
                    .bbgl-ach-row.bbgl-ach-od-row .ach-value { color: #aaa; }
                    .bbgl-ach-row.bbgl-ach-od-row .ach-value.ach-enh-od .ach-enh-e-label { color: #c06060; }

                    /* OD sub-rows: indent the label past the subgroup connector line. The
                       energy-section row padding shorthand (above) outranks the generic
                       .bbgl-subgroup-row padding-left, so restore the indent at higher specificity. */
                    .bbgl-ach-section-energy .bbgl-ach-row.bbgl-ach-od-row,
                    .bbgl-ach-section-hh .bbgl-ach-row.bbgl-ach-od-row {
                        padding-left: 24px;
                    }

                    .ach-happy-word {
                        color: #f5c518;
                        font-weight: 600;
                    }
                    .ach-od-happy-word {
                        color: #c06060;
                    }
                    /* ─────────────────────────────────────────────────────── */

                    .bbgl-ach-row.is-scrub-hovered {
                        background: rgba(255, 255, 255, .04);
                    }

                    .sticker-slot.has-item.is-scrub-hovered {
                        z-index: 45;
                    }

                    #bbgl-settings-view,
                    #bbgl-welcome-view {
                        background: #222;
                        color: #ddd;
                        display: none;
                        flex-direction: column;
                        height: 100%;
                        position: relative;
                        overflow: hidden !important;
                        padding: 0;
                    }

                    #bbgl-settings-view.active-view,
                    #bbgl-welcome-view.active-view {
                        display: flex;
                    }

                    .bbgl-author-block {
                        margin: 8px 10px 10px;
                        padding: 8px 10px;
                        background: #2a2a2a;
                        border: 1px solid #3a3a3a;
                        border-radius: 4px;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        color: #aaa;
                        line-height: 1.6;
                    }

                    .bbgl-author-block strong {
                        color: #ddd;
                        display: block;
                        margin-bottom: 4px;
                        font-size: 13px;
                    }

                    /* CSP-safe author link (replaces inline onmouseover/onmouseout handlers). */
                    .bbgl-author-link {
                        color: #69f0ae;
                        text-decoration: none;
                        border-bottom: 1px dotted rgba(105, 240, 174, 0.4);
                        transition: border-color .2s;
                    }

                    .bbgl-author-link:hover {
                        border-bottom-color: #69f0ae;
                    }

                    .bbgl-settings-author-credit {
                        margin: 8px 10px 0 10px;
                        font-family: Arial, sans-serif;
                        font-size: 11px;
                        color: #888;
                        text-align: center;
                    }

                    .bbgl-settings-scroll-area {
                        flex: 1;
                        overflow-y: auto;
                        overflow-x: hidden;
                        padding: 8px;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    /* Hidden-scrollbar scroll areas — single source for the pattern. */
                    .ledger-content,
                    .calendar-wrapper,
                    .bbgl-settings-scroll-area,
                    .bbgl-modal-window,
                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-bottom-panel {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }

                    .ledger-content::-webkit-scrollbar,
                    .calendar-wrapper::-webkit-scrollbar,
                    .bbgl-settings-scroll-area::-webkit-scrollbar,
                    .bbgl-modal-window::-webkit-scrollbar {
                        display: none;
                    }

                    .bbgl-mask-host {
                        position: relative;
                    }

                    .bbgl-mask-active::after {
                        content: attr(data-mask-text);
                        position: absolute;
                        inset: 0;
                        background: rgba(0, 0, 0, .65);
                        color: #ddd;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        font-weight: 700;
                        text-align: center;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0 20px;
                        box-sizing: border-box;
                        z-index: 50;
                        pointer-events: all;
                        border-radius: 0 0 5px 5px;
                    }

                    .bbgl-init-locked #bbgl-settings-btn,
                    .bbgl-init-locked #bbgl-page-settings {
                        display: none !important;
                    }

                    /* Full-panel Big Black Backfill scan mask. Anchored to #bbgl-content-wrapper
                       (position:relative), so it covers the top + bottom panels and the settings/
                       welcome views while leaving the header (settings/close) reachable. */
                    #bbgl-scan-overlay {
                        position: absolute;
                        inset: 0;
                        z-index: 60;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 14px;
                        padding: 26px 24px;
                        box-sizing: border-box;
                        background: rgba(10, 10, 12, .88);
                        color: #ddd;
                        font-family: Arial, sans-serif;
                        text-align: center;
                        border-radius: 0 0 5px 5px;
                    }
                    #bbgl-scan-overlay .bbgl-scan-title {
                        font-family: "Fjalla One", Arial, sans-serif;
                        font-size: 19px;
                        font-weight: 400;
                        color: #fff;
                        letter-spacing: .4px;
                    }
                    #bbgl-scan-overlay .bbgl-scan-title-row {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                    }
                    #bbgl-scan-overlay .bbgl-scan-title-icon {
                        width: 26px;
                        height: 26px;
                    }
                    #bbgl-scan-overlay .bbgl-scan-title-icon svg { width: 13px; height: 13px; }
                    #bbgl-scan-overlay .bbgl-scan-sub {
                        font-size: 12px;
                        line-height: 1.6;
                        color: #b6b6b6;
                        max-width: 300px;
                    }
                    #bbgl-scan-overlay .bbgl-scan-note {
                        font-size: 11px;
                        font-style: italic;
                        color: #888;
                        max-width: 300px;
                        line-height: 1.5;
                    }
                    #bbgl-scan-overlay .bbgl-scan-count-row {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        font-size: 12px;
                        color: #ccc;
                    }
                    #bbgl-scan-overlay .bbgl-scan-count { color: #b388ff; font-variant-numeric: tabular-nums; }
                    .bbgl-scan-pulse {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: #b388ff;
                        flex: 0 0 auto;
                        animation: bbgl-scan-pulse-anim 1.4s ease-in-out infinite;
                    }
                    @keyframes bbgl-scan-pulse-anim {
                        0%, 100% { opacity: .35; transform: scale(.8); }
                        50% { opacity: 1; transform: scale(1.15); }
                    }
                    #bbgl-panel.bbgl-no-animations .bbgl-scan-pulse {
                        animation: none;
                        opacity: 1;
                    }
                    #bbgl-scan-cancel {
                        position: absolute;
                        top: 22px;
                        right: 16px;
                        font-size: 11px;
                        font-weight: 700;
                        color: #ff5252;
                        cursor: pointer;
                        padding: 4px 9px;
                        border-radius: 4px;
                        text-transform: uppercase;
                        letter-spacing: .5px;
                    }
                    #bbgl-scan-cancel:hover { background: rgba(255, 82, 82, .16); }
                    #bbgl-scan-overlay .bbgl-scan-actions {
                        display: flex;
                        gap: 18px;
                        align-items: center;
                        justify-content: center;
                        margin-top: 2px;
                    }
                    .bbgl-scan-textbtn {
                        cursor: pointer;
                        font-size: 13px;
                        font-weight: 700;
                        color: #dcdcdc;
                        padding: 7px 12px;
                        border-radius: 4px;
                    }
                    .bbgl-scan-textbtn:hover { background: rgba(255, 255, 255, .1); color: #fff; }
                    .bbgl-scan-textbtn.bbgl-scan-primary { color: #b388ff; }
                    .bbgl-scan-textbtn.bbgl-scan-primary:hover { background: rgba(179, 136, 255, .16); }
                    .bbgl-scan-iconbtn {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        cursor: pointer;
                    }
                    .bbgl-scan-iconbtn svg { width: 18px; height: 18px; }
                    .bbgl-scan-iconbtn.bbgl-scan-yes { color: #69f0ae; }
                    .bbgl-scan-iconbtn.bbgl-scan-yes:hover { background: rgba(105, 240, 174, .16); }
                    .bbgl-scan-iconbtn.bbgl-scan-no { color: #ff5252; }
                    .bbgl-scan-iconbtn.bbgl-scan-no:hover { background: rgba(255, 82, 82, .16); }
                    .bbgl-scan-iconbtn.bbgl-scan-play { color: #b388ff; }
                    .bbgl-scan-iconbtn.bbgl-scan-play:hover { background: rgba(179, 136, 255, .16); }

                    .bbgl-ack-check {
                        display: inline-flex;
                        width: 14px;
                        height: 14px;
                        color: #69f0ae;
                        flex: 0 0 auto;
                        margin-top: 2px;
                    }

                    .bbgl-ack-check svg {
                        width: 100%;
                        height: 100%;
                    }


                    .bbgl-modal-overlay {
                        position: fixed;
                        inset: 0;
                        z-index: 9999999;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(0, 0, 0, .7);
                        backdrop-filter: blur(2px);
                        -webkit-backdrop-filter: blur(2px);
                        padding: 20px;
                        box-sizing: border-box;
                        overflow-y: auto;
                    }

                    .bbgl-modal-window {
                        background: #2a2a2a;
                        border: 1px solid #444;
                        border-radius: 5px;
                        width: min(560px, 92vw);
                        max-height: 90vh;
                        overflow-y: auto;
                        overflow-x: hidden;
                        position: relative;
                        padding: 8px;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, .6);
                        box-sizing: border-box;
                    }

                    .bbgl-modal-scrollbox {
                        max-height: 240px;
                        overflow-y: auto;
                        overflow-x: hidden;
                        border: 1px solid #1a1a1a;
                        background: #2a2a2a;
                        border-radius: 4px;
                        padding: 8px 10px;
                        margin: 8px 10px;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        color: #ccc;
                        line-height: 1.5;
                        scrollbar-width: thin;
                        scrollbar-color: #555 #2a2a2a;
                    }

                    .bbgl-modal-scrollbox::-webkit-scrollbar {
                        display: block;
                        width: 4px;
                    }

                    .bbgl-modal-scrollbox::-webkit-scrollbar-thumb {
                        background: #555;
                        border-radius: 4px;
                    }

                    .bbgl-modal-scrollbox strong {
                        color: #ddd;
                        font-size: 12px;
                        font-weight: 700;
                    }

                    .bbgl-modal-scrollbox > strong {
                        display: block;
                        margin-top: 6px;
                        margin-bottom: 2px;
                    }

                    .bbgl-modal-scrollbox > strong:first-child {
                        margin-top: 0;
                    }

                    .bbgl-modal-scrollbox p {
                        margin: 0 0 8px 0;
                    }

                    .bbgl-modal-scrollbox p:last-child {
                        margin-bottom: 0;
                    }

                    .bbgl-ack-row {
                        display: flex;
                        gap: 8px;
                        align-items: center;
                        padding: 4px 0;
                        color: #ccc;
                    }

                    .bbgl-ack-row input[type="checkbox"] {
                        flex: 0 0 auto;
                        cursor: pointer;
                    }

                    .bbgl-ack-row label {
                        cursor: pointer;
                        flex: 1;
                    }

                    .bbgl-btn.bbgl-btn-disabled {
                        filter: grayscale(1);
                        opacity: .5;
                        pointer-events: none;
                    }

                    .bbgl-agree-wrap {
                        flex: 1;
                        display: block;
                    }

                    .bbgl-agree-wrap .bbgl-btn {
                        width: 100%;
                    }

                    @keyframes bbgl-crt-out {
                        0% {
                            transform: scale(1);
                            opacity: 1;
                            filter: brightness(1)
                        }

                        40% {
                            transform: scale(1, .005);
                            opacity: 1;
                            filter: brightness(3)
                        }

                        100% {
                            transform: scale(0, 0);
                            opacity: 0;
                            filter: brightness(0)
                        }
                    }

                    @keyframes bbgl-crt-in {
                        0% {
                            transform: scale(0, 0);
                            opacity: 0;
                            filter: brightness(0)
                        }

                        60% {
                            transform: scale(1, .005);
                            opacity: 1;
                            filter: brightness(3)
                        }

                        100% {
                            transform: scale(1);
                            opacity: 1;
                            filter: brightness(1)
                        }
                    }

                    .bbgl-crt-out {
                        animation: bbgl-crt-out .3s ease-in forwards;
                        transform-origin: center;
                        pointer-events: none;
                    }

                    .bbgl-crt-in {
                        animation: bbgl-crt-in .3s ease-out forwards;
                        transform-origin: center;
                    }

                    [data-tooltip] {
                        cursor: default;
                    }

                    .bbgl-day-cell.ghost-cell::after {
                        content: "";
                        display: block;
                    }

                    .bbgl-day-cell.is-archived .day-num {
                        text-shadow: 0 1px 4px rgba(0, 0, 0, 1), 0 0 2px rgba(0, 0, 0, 1);
                        z-index: 20;
                    }

                    @media (max-width: 800px) {
                        .bbgl-paste-icon {
                            display: none !important;
                        }

                        .bbgl-native-input {
                            padding-left: 10px !important;
                        }
                    }

                    @media (max-width: 620px) {
                        .sticker-nav-btn:hover {
                            transform: none !important;
                            text-shadow: none !important;
                        }

                        .arrow-btn:hover {
                            transform: none !important;
                            text-shadow: 0 1px 3px #000 !important;
                        }

                        .sticker-nav-btn:active {
                            transform: scale(1.16) !important;
                            text-shadow: none !important;
                        }

                        .arrow-btn:active {
                            transform: scale(1.3) !important;
                            text-shadow: 0 0 8px rgba(255, 255, 255, .8) !important;
                        }

                        #bbgl-panel:not(.bbgl-expanded) {
                            max-height: none !important;
                        }

                        /* NOTE: expanded graph .g-pill/.g-toggles/.g-hud/.g-text rules
                           formerly here were dead — overridden at every width <=620px by
                           the later same-specificity fluid rules (see "fluid scaling to
                           replace hard 620px breakpoint" block below). Removed. The
                           .g-text.x-label override that outlived them moved out to that
                           same block: gating a font size on the VIEWPORT while the panel
                           sizes off its own width made the labels jump 11px to 9px the
                           moment the viewport crossed 620px, with the panel still at its
                           full 576px and --bbgl-dock-t still 1 on both sides of the line. */

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-ledger-toggle,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-achievements-toggle,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-copy-btn {
                            width: 15.5px !important;
                            height: 15.5px !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-toggle,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-library-toggle,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-toggle {
                            width: 16px !important;
                            height: 16px;
                        }
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-header-wrapper {
                        flex: 0 0 clamp(140px, calc(140px + 23px * var(--bbgl-dock-t, 0)), 163px);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-header-wrapper::before {
                        border-radius: 5px 5px 0 0;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) {
                        --bbgl-dock-t: clamp(0, calc((100cqi - 300px) / 276px), 1);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) {
                        --bbgl-col-gap: 24px;
                        --bbgl-f-top-mb: clamp(3px, calc(3px + 3px * (1 - var(--bbgl-dock-t, 0))), 6px);
                    }

                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-bottom-panel {
                        overflow-y: auto;
                        overflow-x: hidden;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) .bbgl-grid-container {
                        padding: 0;
                        overflow: visible !important;
                        height: auto;
                        flex: none;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) .calendar-wrapper {
                        overflow: visible !important;
                        height: auto;
                        flex: none;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-month-header {
                        padding-left: 12px;
                        padding-right: clamp(10px, calc(10px + 6px * var(--bbgl-dock-t)), 16px);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .day-num {
                        --day-num-size: clamp(20px, calc(20px + 10px * var(--bbgl-dock-t)), 30px);
                        font-size: clamp(11px, calc(11px + 5px * var(--bbgl-dock-t)), 16px) !important;
                        top: clamp(3px, calc(3px + 3px * var(--bbgl-dock-t)), 6px) !important;
                        left: clamp(3px, calc(3px + 3px * var(--bbgl-dock-t)), 6px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-day-cell.is-viewing .day-num {
                        --day-num-size: clamp(22px, calc(22px + 11px * var(--bbgl-dock-t)), 33px);
                        font-size: clamp(15px, calc(15px + 7px * var(--bbgl-dock-t)), 22px);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-ledger-toggle,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-achievements-toggle,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-copy-btn,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-ledger-toggle svg,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-achievements-toggle svg,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-copy-btn svg {
                        width: 15.5px !important;
                        height: 15.5px;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-toggle,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-library-toggle,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-toggle,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-toggle svg,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-library-toggle svg,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-toggle svg {
                        width: 16px !important;
                        height: 16px !important;
                    }

                    /* Below a 380px screen the expanded band's gaps are already at their floor, so the
                       view icons give up size instead: 3px smaller by a 320px screen. Repeats the
                       !important of the two rules above so it wins against both. */
                    @media (max-width: 380px) {
                        /* The icon gap follows the same curve, 9px down to 7px, in every view so the
                           row lines up whichever page is open. */
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-toolbar {
                            --bbgl-toolbar-gap: clamp(7px, calc(9px + (100vw - 380px) * .034), 9px);
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-ledger-toggle,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-achievements-toggle,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-ledger-toggle svg,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-achievements-toggle svg {
                            width: clamp(12.5px, calc(15.5px + (100vw - 380px) * .05), 15.5px) !important;
                            height: clamp(12.5px, calc(15.5px + (100vw - 380px) * .05), 15.5px) !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-toggle,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-library-toggle,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-toggle,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-toggle svg,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-library-toggle svg,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-toggle svg {
                            width: clamp(13px, calc(16px + (100vw - 380px) * .05), 16px) !important;
                            height: clamp(13px, calc(16px + (100vw - 380px) * .05), 16px) !important;
                        }
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .arrow-btn {
                        font-size: clamp(18px, calc(18px + 3px * var(--bbgl-dock-t)), 21px);
                    }

#bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #year-trigger {
                        font-size: clamp(13px, calc(13px + 2px * var(--bbgl-dock-t)), 15px);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #month-trigger {
                        font-size: clamp(20px, calc(20px + 3px * var(--bbgl-dock-t)), 23px);
                    }
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #all-time-trigger {
                        font-size: clamp(28px, calc(28px + 4px * var(--bbgl-dock-t)), 32px);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .ui-floating-label,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .ui-floating-summary {
                        font-size: clamp(10px, calc(10px + 2px * var(--bbgl-dock-t)), 12px);
                    }

                    #bbgl-panel.bbgl-compact .ui-floating-label,
                    #bbgl-panel.bbgl-compact .ui-floating-summary {
                        font-size: 10px !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #year-stats-btn,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #month-stats-btn,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #all-time-btn {
                        width: clamp(17px, calc(17px + 7px * var(--bbgl-dock-t)), 24px) !important;
                        height: clamp(18px, calc(18px + 7px * var(--bbgl-dock-t)), 25px);
                    }
                    /* Expanded panel graph view: fluid scaling to replace hard 620px breakpoint ---------------------*/
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .g-pill {
                        /* On -pills rather than the raw width ratio, so the pills hold their 10px
                           top through the first stage of narrowing and only travel once the band's
                           whitespace is spent (see "Staged width curves").

                           Side padding runs a stage AHEAD of the type, which is what lets the text
                           stay legible further into the narrowing than it used to: the pill gives
                           up its own internal margins first and only starts setting smaller once
                           it is down to 2.75px a side. Vertical padding is a flat 1.5px — height
                           is not what the band is short of, so there is nothing to buy by trading
                           it away.

                           The floors are raised from the 6.25px/1.5px this carried before, because
                           that pair was budgeted against a band whose whitespace was all rigid: at
                           6.25/1.5 the two groups measured 140.2px against the 149px a 300px panel
                           leaves them, so the gap sat at its minimum with ~9px to spare. Staging
                           has since freed ~39px more elsewhere in the band (inter-pill gap 6px->1px
                           over five gaps, -min-gap 12px->8px, icon gaps 11px->9px over five), so
                           shrinking all the way to that old pair now OVERSHOOTS and the cluster gap
                           re-opens instead of holding at its minimum. Reckoned at roughly 15.5px of
                           cluster width per 1px of font (25 characters across the seven pills) and
                           14px per 1px of side padding. */
                        font-size: clamp(6.75px, calc(6.75px + 3.25px * var(--bbgl-t-type)), 10px);
                        padding: 1.5px clamp(2.75px, calc(2.75px + 5.25px * var(--bbgl-t-pad)), 8px);
                        line-height: 1;
                        display: inline-flex !important;
                        align-items: center;
                        justify-content: center;
                        box-sizing: border-box;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .g-toggles {
                        gap: clamp(1px, calc(1px + 5px * var(--bbgl-t-gaps)), 6px);
                        align-items: center;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-text {
                        font-size: clamp(10px, calc(10px + 1px * var(--bbgl-dock-t)), 11px);
                    }

                    /* X labels need a rule of their own because they have to reach further down
                       than the .g-text rule above can go: that one floors at 10px, and a narrow
                       panel needs 8px here. Same --bbgl-dock-t the rest of this block rides, so
                       the size tracks the PANEL's width, not the viewport's — the 11px top is the
                       value a full-width panel has always rendered, now held until the panel
                       itself actually starts to narrow. */
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-text.x-label {
                        font-size: clamp(8px, calc(8px + 3px * var(--bbgl-dock-t)), 11px);
                    }

                    /* Expanded panel sticker grid: fluid sticker slot sizing to keep proportions --------------------*/
                    /* Switch to size containment on expanded panel only so cqi/cqb can read both axes. --------------*/
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) {
                        container-type: size;
                    }

                    /* ─── Staged width curves ───────────────────────────────────────────
                       -w is the one width ratio every mode-agnostic rule below reads: 1 at the
                       mode's widest, 0 at its narrowest. Same dock-t-then-page-t fallback the
                       achievements font levers use directly, named once here so a consumer does
                       not have to restate it.

                       -gaps, -pad and -type split that single ratio into three NON-OVERLAPPING
                       stages, so a shrinking band spends its slack in a deliberate order rather
                       than taking it out of everything at once. Narrowing from the top, each stage
                       runs 1 to 0 while the ones after it stay pinned at 1:

                         -gaps  the whitespace BETWEEN things — the clearance between the two pill
                                clusters, between pills, and between the toolbar icons.
                         -pad   the whitespace INSIDE a pill, left and right of its text.
                         -type  the pill text itself, the last thing to give and the only one a
                                reader actually loses detail from.

                       So the band closes up, then the pills tighten around their own labels, and
                       only once neither has anything left does the type come down. Every consumer
                       still lands on exactly the floor and maximum it already declared — the stages
                       change WHEN each one travels, not where it ends up.

                       Pill HEIGHT is deliberately absent: vertical padding is a constant, so a
                       narrowing band takes width out of a pill and leaves its height alone (what
                       height it does lose comes from the type, unavoidably).

                       The .70 and .35 are the two handoffs and they are the knobs for the whole
                       arrangement. Each stage should span roughly the share of the narrowing its
                       own reclaim can pay for, or the leftover space swings the wrong way and the
                       cluster gap grows back mid-range instead of closing. Sized from an estimated
                       character advance, so treat them as tuned-by-eye rather than derived. Every
                       divisor is a stage's own width (1 - .70, then .70 - .35, then .35), so moving
                       a handoff means editing the divisors on both sides of it too. */
                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) {
                        --bbgl-t-w: var(--bbgl-dock-t, var(--bbgl-page-t, 0));
                        --bbgl-t-gaps: clamp(0, calc((var(--bbgl-t-w) - .70) / .30), 1);
                        --bbgl-t-pad: clamp(0, calc((var(--bbgl-t-w) - .35) / .35), 1);
                        --bbgl-t-type: clamp(0, calc(var(--bbgl-t-w) / .35), 1);
                        /* -w read the other way up, for the rules that GROW as things get tighter
                           rather than shrink. Not a stage — it spans the whole range, because what
                           it spends is height, and height is not what a narrowing panel is short of;
                           it is what a narrowing panel has spare. */
                        --bbgl-t-narrow: calc(1 - var(--bbgl-t-w));
                    }

                    /* Achievements page font-size levers — one definition per tier, referenced
                       by every consumer below via var(). Change a size here, not at each call site.
                       Shared by expanded and page mode: falls back from --bbgl-dock-t (expanded/
                       compact width ratio) to --bbgl-page-t (page mode's own width ratio) so both
                       modes scale identically off the same formulas. */
                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) {
                        --bbgl-ach-fs-icon: clamp(27px, calc(27px + 13px * var(--bbgl-dock-t, var(--bbgl-page-t, 0))), 40px);
                        --bbgl-ach-fs-message: clamp(12px, calc(12px + 2px * var(--bbgl-dock-t, var(--bbgl-page-t, 0))), 14px);
                        --bbgl-ach-fs-subtitle: 9px;
                        --bbgl-ach-fs-row: clamp(10px, calc(10px + 1px * var(--bbgl-dock-t, var(--bbgl-page-t, 0))), 11px);
                        --bbgl-ach-fs-label: clamp(8px, calc(8px + 1px * var(--bbgl-dock-t, var(--bbgl-page-t, 0))), 9px);
                        --bbgl-ach-fs-date: clamp(9px, calc(9px + 1px * var(--bbgl-dock-t, var(--bbgl-page-t, 0))), 10px);
                        --bbgl-ach-fs-time: clamp(8px, calc(8px + .5px * var(--bbgl-dock-t, var(--bbgl-page-t, 0))), 8.5px);
                        --bbgl-ach-fs-hint: clamp(6.5px, calc(6.5px + 1px * var(--bbgl-dock-t, var(--bbgl-page-t, 0))), 7.5px);
                        --bbgl-ach-fs-tag: clamp(7px, calc(7px + 1px * var(--bbgl-dock-t, var(--bbgl-page-t, 0))), 8px);
                    }

                    /* Page mode gets a wider min/max spread than expanded on the same font tiers,
                       since its width range is bigger and the 1px expanded swing reads as static. */
                    #bbgl-panel.bbgl-mode-page {
                        --bbgl-ach-fs-icon: clamp(25px, calc(25px + 17px * var(--bbgl-page-t, 0)), 42px);
                        --bbgl-ach-fs-message: clamp(10px, calc(10px + 6px * var(--bbgl-page-t, 0)), 16px);
                        --bbgl-ach-fs-subtitle: clamp(8px, calc(8px + 4px * var(--bbgl-page-t, 0)), 12px);
                        --bbgl-ach-fs-row: clamp(9px, calc(9px + 4px * var(--bbgl-page-t, 0)), 13px);
                        --bbgl-ach-fs-label: clamp(7px, calc(7px + 4px * var(--bbgl-page-t, 0)), 11px);
                        --bbgl-ach-fs-date: clamp(7px, calc(7px + 5px * var(--bbgl-page-t, 0)), 12px);
                        --bbgl-ach-fs-time: clamp(6px, calc(6px + 4.5px * var(--bbgl-page-t, 0)), 10.5px);
                        --bbgl-ach-fs-hint: clamp(4.5px, calc(4.5px + 5px * var(--bbgl-page-t, 0)), 9.5px);
                        --bbgl-ach-fs-tag: clamp(5px, calc(5px + 5px * var(--bbgl-page-t, 0)), 10px);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .sticker-slot {
                        height: 88px;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .sticker-slot-sponsor {
                        height: min(clamp(110px, calc(110px + 27px * var(--bbgl-dock-t)), 137px), clamp(110px, calc(90px + 7.4cqb), 137px));
                        max-width: clamp(120px, calc(120px + 32px * var(--bbgl-dock-t)), 152px);
                    }

                    /* As the docked panel narrows, the grid bleeds out into the arrow gutters so the
                       auto columns (and the stickers capped at their width) shrink later and slower.
                       Only the outer columns reach the gutters, and their stickers sit in the top and
                       bottom rows, above and below the vertically centred arrows. None at full width,
                       ramping to --bbgl-sticker-bleed-max of each gutter at the narrowest. */
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-grid {
                        row-gap: clamp(0px, calc(3px * var(--bbgl-dock-t)), 3px);
                        --bbgl-sticker-bleed-max: .75;
                        --bbgl-sticker-bleed: calc(var(--bbgl-sticker-arrow-w) * var(--bbgl-sticker-bleed-max) * (1 - var(--bbgl-dock-t)));
                        width: calc(100% + 2 * var(--bbgl-sticker-bleed));
                        margin-inline: calc(-1 * var(--bbgl-sticker-bleed));
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-container {
                        --bbgl-sticker-arrow-w: clamp(24px, calc(24px + 16px * var(--bbgl-dock-t)), 40px);
                        --bbgl-sticker-title-clear: clamp(23px, calc(23px + 2px * var(--bbgl-dock-t)), 25px);
                    }
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .sticker-nav-btn {
                        font-size: clamp(20px, calc(20px + 12px * var(--bbgl-dock-t)), 32px);
                        width: var(--bbgl-sticker-arrow-w) !important;
                    }

                    .bbgl-coming-soon {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        color: rgba(255, 255, 255, .7);
                        font-size: 24px;
                        font-weight: bold;
                        letter-spacing: 2px;
                        z-index: 10;
                        pointer-events: none;
                        text-shadow: 0 0 10px rgba(255, 255, 255, .2);
                        text-align: center;
                        line-height: 1.2;
                    }

                    @keyframes bbgl-sticker-gold-shimmer {
                        0% {
                            background-position: 100% 50%;
                        }

                        50% {
                            background-position: 45% 50%;
                        }

                        100% {
                            background-position: 0% 50%;
                        }
                    }

                    /* The prev arrow goes gold when the page it would step back to is the
                       sponsorship page — .is-sponsor is set in renderStickers()
                       (09-section-viii-stickers.js). This was a whole separate #sticker-sponsor-btn
                       element until it was folded in here: it sat at the identical position with
                       the identical glyph, and the two were kept mutually exclusive by toggling
                       .disabled on each, so it was only ever "prev, but gold" wearing its own id.
                       Purely appearance now — position/size stay with the base #sticker-prev-btn
                       rules above, which also drops a copy-paste inversion the old element carried
                       (it clamped its page-mode left offset on 1 - --bbgl-page-t, the opposite
                       direction to every other nav arrow). */
                    #sticker-prev-btn.is-sponsor {
                        background: linear-gradient(110deg, #9a7200 0%, #d9ad12 34%, #fff3a2 48%, #d9ad12 62%, #9a7200 100%);
                        background-size: 220% 100%;
                        background-position: 0% 50%;
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        color: transparent;
                        opacity: .9;
                        mix-blend-mode: normal;
                        text-shadow: none;
                    }

                    @media (hover: hover) {
                        #sticker-prev-btn.is-sponsor:hover {
                            opacity: 1;
                            text-shadow: none;
                        }
                    }

                    #sticker-prev-btn.is-sponsor:active {
                        opacity: .98;
                        text-shadow: none;
                    }

                    /* The sponsor cue keeps its one-time gold animation, but the highlight travels
                       inside the glyph rather than casting a detached halo around it. */
                    #sticker-prev-btn.is-sponsor.shimmer-once {
                        animation: bbgl-sticker-gold-shimmer 2s ease-in-out forwards;
                    }

                    #bbgl-sponsor-grid {
                        position: relative;
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        grid-template-rows: 1fr;
                        width: 100%;
                        flex: 1;
                        align-content: center;
                        align-items: center;
                        justify-items: center;
                        padding: 0;
                        gap: 0;
                        margin: 0 -6px;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sponsor-grid {
                        gap: 0;
                        padding: 0;
                        margin: 0 -10px;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-sponsor-grid {
                        gap: 0;
                        padding: 0;
                        margin: 0 clamp(-10px, calc(-10px + 7px * var(--bbgl-page-t)), -3px) 0;
                    }

                    .sticker-slot-sponsor {
                        height: 106px;
                        width: 100%;
                        max-width: 116px;
                        position: relative;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        overflow: visible;
                    }

                    #bbgl-panel.bbgl-mode-page .sticker-slot-sponsor {
                        height: clamp(104px, calc(104px + 68px * var(--bbgl-page-t)), 172px);
                        max-width: clamp(114px, calc(114px + 78px * var(--bbgl-page-t)), 192px);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .sticker-slot-sponsor {
                        height: 137px;
                        max-width: 152px;
                    }

                    .sponsor-sticker-svg {
                        width: 90%;
                        height: 90%;
                        filter: drop-shadow(0 -.5px 0 rgba(0, 0, 0, .2)) drop-shadow(0 .5px 0 rgba(255, 255, 255, .2));
                        opacity: .9;
                    }

                    .sponsor-sticker-label {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-family: 'Fjalla One', sans-serif;
                        font-size: 11px;
                        color: #666;
                        text-align: center;
                        line-height: 1.3;
                        pointer-events: none;
                        z-index: 5;
                        letter-spacing: .3px;
                        text-shadow: 0 1px 1px rgba(255, 255, 255, .4);
                    }

                    .bbgl-expanded .sponsor-sticker-label {
                        font-size: clamp(9px, calc(9px + 2px * var(--bbgl-dock-t, 0)), 11px);
                    }

                    #bbgl-panel.bbgl-mode-page .sponsor-sticker-label {
                        font-size: clamp(8px, calc(8px + 5px * var(--bbgl-page-t)), 13px);
                    }


                    /* The sole box between the SVG toolbar row and the page content: it holds the
                       injected ach/titles page directly (the old .bbgl-ach-scroll > #bbgl-ach-pages
                       wrappers were folded away — they added nothing but duplicate flex/clip chrome
                       and a redundant nested container context). It is the flex column the page
                       fills (display:flex/flex:1 come from the .viewing-achievements rule above) and
                       the query container the stat grid reads (see @container bbgl-ach further down).

                       --bbgl-ach-container-pt is this box's per-mode top padding — clearance for the
                       SVG icon row above it — set by the tall/compact/page rules elsewhere; the sole
                       padding-top declaration lives here so no mode rule has to restate it (and none
                       has to carry !important to win). Ordinary pages receive a small horizontal
                       inset; Titles opts out so its grid can divide the complete width geometrically. */
                    #bbgl-achievements-container {
                        position: relative;
                        min-height: 0;
                        overflow: hidden;
                        container-type: inline-size;
                        container-name: bbgl-ach;
                        --bbgl-ach-font: 'Barlow Condensed', 'Arial Narrow', 'Nimbus Sans Narrow', Tahoma, sans-serif;
                        --bbgl-ach-val-font: 'Inconsolata', monospace;
                        --bbgl-ach-row-pad-v: clamp(1px, 1.4cqi, 3px);
                        --bbgl-ach-container-pt: 0px;
                        padding-top: var(--bbgl-ach-container-pt);
                    }

                    /* Docked into the SVG icon toolbar row (top of #bbgl-top-panel) rather than a
                       full-width bar of its own at the bottom — see
                       layoutToolbarPaginationPosition()/observeToolbarPaginationPosition()
                       (07-section-vi-ui.js), which set --bbgl-ach-dot-x/-y to the live computed
                       centre: centred across the full #bbgl-top-panel width if the toolbar occupies
                       <=25% of it, and centred in the remaining space to the toolbar's right
                       otherwise. The stickerbook's own #bbgl-sticker-pagination-bar shares
                       this exact same mechanism (and these same two custom properties) — see its
                       own comment further down this file. #bbgl-top-panel is already
                       position:relative, the same containing block the toolbar icons themselves
                       use, so this only needed a re-target of where it draws, not a DOM move.
                       Sized to its own content now (no more grid-template-columns spreading prev/
                       dots/next across the full width) since it's a small cluster living inline
                       with the icons rather than a bar spanning the panel. */
                    #bbgl-ach-footer {
                        /* Very slightly wider than the dots' own diameter — a bit more breathing
                           room between them now that they've grown. */
                        --bbgl-ach-dot-gap: 8px;
                        /* Bigger than the base .pg-dot (6px, still what the stickerbook's own
                           sponsor dot and any other bare .pg-dot use) — these sit inline with the
                           SVG toolbar icons rather than in their own dedicated bar, so they need
                           more visual weight to read as a distinct, tappable control instead of
                           getting lost next to the icons. #bbgl-sticker-pagination-bar copies this
                           same value for its own dots, which reuse this whole rule set — see its
                           own comment further up this file. */
                        --bbgl-ach-dot-w: 8px;
                        /* Tap targets (--bbgl-ach-nav-py/-px below, the dot's own ::before hit-box)
                           stayed put across these size passes — only the VISUAL size keeps coming
                           down, since clickability was already right early on. */
                        --bbgl-ach-nav-size: clamp(7px, calc(1.3 * var(--bbgl-ach-dot-w)), 11px);
                        /* Was 0 — the glyph itself was the entire tap target, no room around it to
                           actually hit. Real vertical padding here, plus the hit-area background on
                           .bbgl-ach-nav below, are what make these properly tappable rather than
                           just visually present. */
                        --bbgl-ach-nav-py: 4px;
                        --bbgl-ach-nav-px: clamp(4px, calc(4px + 8px * var(--bbgl-dock-t, 0)), 12px);
                        /* top is JS-computed too (--bbgl-ach-dot-y, layoutToolbarPaginationPosition() in
                           07-section-vi-ui.js) — the vertical centre of the toolbar icons
                           themselves, same idea as --bbgl-ach-dot-x for the horizontal placement.
                           Replaces separate hand-tuned top values per panel mode (compact/expanded/
                           tall all shared one flat px, page mode had its own clamp) with one rule
                           that stays correct automatically if the icons' own size/position ever
                           changes again. */
                        position: absolute;
                        top: var(--bbgl-ach-dot-y, 12px);
                        left: var(--bbgl-ach-dot-x, 50%);
                        transform: translate(-50%, -50%);
                        z-index: 61;
                        display: none;
                        align-items: center;
                        gap: var(--bbgl-ach-dot-gap);
                        min-height: 0;
                        box-sizing: border-box;
                    }

                    #bbgl-top-panel.viewing-achievements #bbgl-ach-footer {
                        display: flex;
                    }

                    /* An inline SVG chevron now (ICONS.CHEVRON, 07-section-vi-ui.js), not a Unicode
                       "❮"/"❯" glyph — that character's actual ink doesn't sit centred in its own
                       line-box in Arial, which only became a visible problem once these needed
                       pixel-precise vertical alignment against the dots rather than just looking
                       fine sitting on their own. An SVG's box IS its visual extent, so centering it
                       with flex is now exact regardless of font metrics. .bbgl-ach-next mirrors the
                       shared icon with scaleX(-1) below rather than a second hand-drawn path. */
                    .bbgl-ach-nav {
                        position: relative;
                        top: auto;
                        transform: none;
                        /* Same idle opacity as the SVG toolbar icons above them (see
                           #bbgl-ledger-toggle et al) rather than a flat grey, so the two read as one
                           family of controls instead of the arrows looking like an unstyled
                           afterthought next to them. */
                        color: rgba(255, 255, 255, .55);
                        cursor: pointer;
                        z-index: 20;
                        user-select: none;
                        /* Real tap target: this padding, not the bare glyph, is what got these
                           properly tappable — no visible background/circle any more (tried and
                           removed on request), just the padding plus the hover/active glow+scale
                           below. */
                        padding: var(--bbgl-ach-nav-py) var(--bbgl-ach-nav-px);
                        margin: 0;
                        transition: color .2s, transform .15s;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        background: transparent;
                        border: none;
                        line-height: 1;
                        -webkit-appearance: none;
                        appearance: none;
                    }

                    .bbgl-ach-nav svg {
                        width: var(--bbgl-ach-nav-size);
                        height: var(--bbgl-ach-nav-size);
                        stroke: currentColor;
                        display: block;
                    }

                    .bbgl-ach-next svg {
                        transform: scaleX(-1);
                    }

                    body:not(.is-touch-device) .bbgl-ach-nav:hover {
                        color: #fff;
                        filter: drop-shadow(0 0 3px #fff);
                        transform: scale(1.15);
                    }

                    .bbgl-ach-nav:active {
                        color: #fff;
                        filter: drop-shadow(0 0 3px #fff);
                        transform: scale(1.15);
                    }

                    .bbgl-ach-section {
                        margin-bottom: 0;
                        width: 100%;
                        box-sizing: border-box;
                        overflow: visible;
                    }

                    .bbgl-ach-cols,
                    .bbgl-ach-col,
                    .bbgl-ach-row,
                    .ach-v-wrap,
                    .bbgl-ach-row .ach-value {
                        overflow: visible;
                    }

                    /* Ordinary flow child of #bbgl-achievements-container, like every other ach page
                       (the old absolutely-positioned version stayed clipped to half height until a
                       refresh).

                       EVERY value that differs between panel modes lives in the two var blocks below
                       and nowhere else — component rules further down consume var()s only, no
                       literal sizes or clamps of their own. One layout for all three modes: identity
                       card + unlock grid stacked above a horizontal rank bar pinned to the bottom;
                       only the var tables differ between modes.

                       Expanded/page use clamp()s that track the container (they can resize/pop out);
                       compact's width never changes, so its values are plain fixed px. Within the
                       clamps: HORIZONTAL sizes (text) scale off cqi, VERTICAL sizes (gaps, bar
                       thickness) scale off cqb — cqi says nothing about available height, so tying
                       vertical spacing to it shrank things whenever the panel merely got narrower
                       (container-type:size, not just inline-size, is what makes cqb legal here).
                       This page is the only container on the way down, so every cqi/cqb resolves
                       against its own box.

                       Which mode scales what: PAGE scales throughout, stars included. EXPANDED caps
                       at 576px — stars/stat labels/tier numbers are flat px so corners crowd inward
                       instead of shrinking, though card text still eases down. COMPACT is fixed
                       width, so everything is flat px. */
                    .bbgl-titles-page {
                        container-type: size;
                        container-name: bbgl-titles;

                        /* Type scale. The card (-name/-line/-line-label) scales gently — a narrow
                           panel should ease the text down, not resize it dramatically. */
                        --bbgl-t-fs-name: clamp(12px, 2.4cqi, 19px);
                        /* The suspended neon sign runs larger than the card type it sits above —
                           it's the marquee, not a label. A multiplier rather than its own size so
                           it still tracks -fs-name's per-mode value, and a variable rather than a
                           literal so a mode can dial the emphasis back (compact does: the sign is
                           in-flow horizontally, so its width sets the centre grid column's width,
                           and compact has the least room to give the stat columns either side). */
                        --bbgl-t-name-scale: 1.45;
                        --bbgl-t-fs-line: clamp(9px, 1.8cqi, 14px);
                        --bbgl-t-fs-line-label: clamp(7px, 1.3cqi, 10px);
                        --bbgl-t-fs-notch: clamp(9px, 1.7cqi, 12px);
                        --bbgl-t-fs-label: clamp(8px, 1.35cqi, 10px);
                        --bbgl-t-fs-block-label: clamp(11px, 1.8cqi, 15px);

                        /* Spacing. -gap is horizontal, -gap-v vertical. -corner-shift-y
                           nudges both columns down off the top edge — see .bbgl-titles-main and
                           .bbgl-titles-corner-col below. -main-pb trims the grid's bottom edge back
                           off the pagination dots. -cards-lift is separate from -corner-shift-y: it's
                           an upward nudge on top of it, subtracted into .bbgl-titles-corner-col's own
                           transform below (kept as its own var rather than folded into
                           -corner-shift-y so the two nudges — "off the top edge" vs. "up overall" —
                           stay independently tunable). The identity card consumes the same net
                           shift in .bbgl-titles-center, keeping its centreline aligned with the
                           visual centre of both stat-card columns. */
                        --bbgl-t-cards-lift: clamp(6px, 1.4cqb, 14px);
                        --bbgl-t-gap: clamp(3px, .6cqi, 6px);
                        --bbgl-t-gap-v: clamp(2px, .6cqb, 6px);
                        --bbgl-t-block-gap: calc(var(--bbgl-t-gap-v) * .75);
                        /* There is no --bbgl-t-corner-gap. It was declared here and in all four other
                           mode blocks, described as the room between the stat columns, and read by
                           nothing — the horizontal spacing is emergent instead: .bbgl-titles-main is
                           1fr/auto/1fr with no column gap, and each stat column is justify-self:
                           center inside its own fr track, so the "gap" is just the slack left when a
                           track is wider than the column standing in it. Removed rather than wired
                           up, since the emergent version is what every mode was actually tuned
                           against. */
                        --bbgl-t-corner-shift-y: clamp(3px, 1cqb, 9px);
                        /* Moves the complete five-card cluster as one without changing its internal
                           centring. The rank geometry pass reads the resulting lower-card edge and
                           automatically recentres the bar in the reduced space beneath it. */
                        --bbgl-t-main-shift-y: 3px;
                        /* Minimum vertical space between a column's top/bottom stat block, on top of
                           whatever space-between already provides — gap sets a floor that
                           space-between can grow past but not shrink below. Needed because enlarging
                           the stat blocks crowded the column's own corners together at max page
                           size; only applies within a column, not the identity card. Compact pins
                           this to 0 below, since it wasn't needed there. */
                        --bbgl-t-corner-vgap: clamp(3px, 1.8cqb, 16px);
                        /* 0 — nothing to clear here since the pagination-dot footer moved into the
                           SVG icon toolbar (layoutToolbarPaginationPosition(), 07-section-vi-ui.js);
                           this lets the stat blocks' own space-between spread further apart into
                           the reclaimed room automatically. */
                        --bbgl-t-main-pb: 0px;
                        /* The rank bar's downward position is carried entirely by the container's own
                           bottom padding (see .viewing-achievements #bbgl-achievements-container —
                           2px): .bbgl-titles-page fills that container's box exactly, so the bar rides
                           this page's bottom edge, which already sits at the container's. -cards-drop
                           is a separate small nudge on just the cards above (via .bbgl-titles-main's
                           margin-top), independent of the bar. */
                        --bbgl-t-cards-drop: -3px;
                        /* Shared responsive chrome measurements. The stat windows consume the full
                           set; the title assembly reuses radius/gap values for its metal sign so its
                           proportions continue to track the surrounding cards. */
                        --bbgl-t-win-pad: clamp(3px, 1.8cqi, 12px);
                        --bbgl-t-win-pad-y: clamp(4px, 1.6cqb, 9px);
                        --bbgl-t-win-radius: clamp(6px, 1.4cqi, 12px);
                        --bbgl-t-win-glow: 1;

                        /* Stat-name label (.bbgl-title-block-label), now straddling the block's top
                           border instead of hanging below it. Only about half its rendered height
                           pokes above the block's own box (it's vertically centred ON the border
                           line), so this is the vertical clearance .bbgl-title-block reserves via
                           margin-top — derived from --bbgl-t-fs-block-label (line-height is 1, so
                           font-size doubles as a line-height proxy) rather than hand-tuned, same
                           pattern the old sign-space var used. Only declared here (not per-mode
                           below) since it's a plain calc() off a var that already varies per mode. */
                        --bbgl-t-label-clear: calc(var(--bbgl-t-fs-block-label) * .6 + 2px + 2.5px);
                        /* Offset from a stat stack's margin box to its upper neon frame. */
                        --bbgl-t-stack-frame-offset: var(--bbgl-t-label-clear);

                        /* Engraved rank scale. -rank-h reserves the vertical word plaques above the
                           groove plus some working room around it. Giving this sibling real height
                           shortens .bbgl-titles-main, which pulls each column's lower stat card
                           toward its upper card and transfers that recovered space to the rank area.

                           The max(0px, 10cqi - 50px) term is deliberately dormant through 500px:
                           narrow and middle page widths retain the already-approved 11cqb result,
                           then only the wide end gains room. The first term contributes ~11px and
                           the second another ~15px at maximum page width. The high ceiling is only
                           a guard now, not something the normal responsive value should hit. */
                        --bbgl-t-rank-h: clamp(46px, calc(11cqb + max(0px, 10cqi - 50px) + max(0px, 13cqi - 65px)), 96px);
                        --bbgl-t-rank-tag-pad-x: clamp(3px, .7cqi, 6px);
                        --bbgl-t-rank-tag-pad-y: 1px;
                        --bbgl-t-rank-tag-cut: clamp(1px, .35cqi, 3px);
                        --bbgl-t-bar-h: 1px;
                        /* -display-w is only the steady width of the readout's dark pool now; the
                           readout's HEIGHT is just its own line box, so there is no -display-h. */
                        --bbgl-t-display-w: clamp(25px, 5cqi, 34px);
                        --bbgl-t-display-fs: clamp(9px, 1.8cqi, 13px);
                        /* The anchored gap held at the far left and far right of the rank area. This
                           is now the ONLY number placing the rank axis horizontally: everything
                           inside it — track width, slot width, groove length, end-title clearance —
                           falls out of it and the title count (see .bbgl-rank-line).

                           Anchored, so it does not scale, which is exactly what makes the groove
                           scale: the track is the full width minus two fixed gaps, so the groove
                           keeps a near-constant SHARE of the rank area at every width instead of
                           being squeezed by a proportional inset that grew fastest where there was
                           already the most room.

                           It replaces five hand-tuned per-mode insets. Those existed because a fixed
                           inset had to be guessed against label widths at each width; the end titles'
                           clearance is half a slot now, so it scales on its own and there is nothing
                           left to guess per mode. Compact keeps an override only because its rank
                           area is the narrowest in the app. */
                        --bbgl-t-rank-edge: 6px;

                        /* Unlock rows. 5 over 5 in every mode now — one star size drives both rows
                           (see .bbgl-title-star-row below). These are page mode's values — it's the
                           roomiest, so it's the baseline the other two trim down from, and the only
                           mode whose stars scale: page mode is full-width and can be anywhere from a
                           narrow column to the whole screen, so a fixed star size would be wrong at
                           one end or the other. */
                        --bbgl-t-star: clamp(16px, 3.6cqi, 38px);
                        --bbgl-t-star-cgap: clamp(2px, .5cqi, 6px);
                        --bbgl-t-star-rgap: 0px;
                        --bbgl-t-reset: 14px;

                        position: relative;
                        display: flex;
                        flex-direction: column;
                        align-items: stretch;
                        gap: calc(var(--bbgl-t-gap-v) * 2);
                        /* Auto width stretches to the achievements container's complete content box. */
                        width: auto;
                        min-height: 0;
                        box-sizing: border-box;
                        /* Cancel only the achievements container's vertical padding so this page's
                           clip edge still reaches the toolbar-safe top and bottom boundaries. There
                           is no horizontal cancellation or replacement: both boxes now expose their
                           complete width directly to the shared three-track card grid. */
                        height: calc(100% + var(--bbgl-ach-container-pt) + 2px);
                        margin: calc(var(--bbgl-ach-container-pt) * -1) 0 -2px;
                        padding: calc(var(--bbgl-ach-container-pt) + 2px) 0 2px;
                        /* ach pages never scroll — everything is sized to fit instead */
                        overflow: hidden;
                    }

                    /* The rank bar rests on the floor of its space in both resizable modes instead of
                       centring in it — read by layoutRankBarCenter() (07-section-vi-ui.js), which
                       solves the placement against the live measured geometry.

                       Centring is right when the space is fixed, and this one is not: narrowing
                       either mode shrinks the stat cards above, which hands height back and grows
                       the region from the top. Centred, the bar rides that growth upward and the
                       recovered height ends up as dead air split above and below it. Anchored, the
                       bar holds its distance off the page's bottom edge and the height stays in one
                       piece at the top, where the cards can be given it back (see -corner-vgap and
                       .bbgl-titles-center's min-height).

                       -rank-floor IS that distance once the bias is 1, rather than the emergency
                       clearance it stays at the default bias — so it is the knob for how far off the
                       bottom the bar sits. Compact declares neither and keeps centring: its panel is
                       a fixed size, so it has no growing region to correct for, and it already has
                       its own -rank-nudge-y/-rank-floor tuning. */
                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-titles-page {
                        --bbgl-t-rank-bias: 1;
                        --bbgl-t-rank-floor: 8px;
                    }

                    /* Page mode is intentionally step-sized from the OUTER page box, not fluidly
                       scaled from the inner achievements box. Torn exposes exactly three useful
                       page widths here: <=385px, 386-783px and >=784px. Every value below is the
                       rendered pixel result captured at the approved representative layout for
                       that tier (about 320px, 386px and 784px respectively).

                       The titles page stops being a size container in page mode because it has no
                       remaining cqi/cqb consumers. Expanded mode keeps the shared size-container
                       setup and its fluid rules below untouched. */
                    #bbgl-panel.bbgl-mode-page .bbgl-titles-page {
                        container-type: normal;
                        container-name: none;
                        --bbgl-t-cards-drop: -3px;
                        --bbgl-t-main-pb: 0px;
                        --bbgl-t-win-glow: 1;
                        --bbgl-t-rank-tag-pad-y: 1px;
                        --bbgl-t-bar-h: 1px;
                        --bbgl-t-reset: 14px;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-titles-name {
                        max-width: 260px;
                    }

                    @container bbgl-page (max-width:385px) {
                        #bbgl-panel.bbgl-mode-page .bbgl-titles-page {
                            --bbgl-t-fs-name: 11.25px;
                            --bbgl-t-name-scale: 1.45;
                            --bbgl-t-fs-line: 8.5px;
                            --bbgl-t-fs-line-label: 6.625px;
                            /* The rank bar's milestone titles. This tier used to carry the same
                               8.25px as the 386-783px one, so the narrowest page never actually
                               stepped its rank titles down — the longest of them (two-line names
                               like Fully Bricked) were being set at mid-tier size on the narrowest
                               groove they ever sit on. 7.5px lands between that 8.25px and the 7px
                               compact runs at.

                               Also shortens the milestone ticks, which derive from this same value
                               (--bbgl-t-tick-h / --bbgl-t-slider-tick-h on .bbgl-rank-line), so the
                               scale steps down as one piece rather than the type alone. */
                            --bbgl-t-fs-notch: 7.5px;
                            --bbgl-t-fs-label: 7.25px;
                            --bbgl-t-fs-block-label: 10.25px;
                            --bbgl-t-label-clear: 10.65px;
                            --bbgl-t-stack-frame-offset: 10.65px;

                            --bbgl-t-cards-lift: 5px;
                            --bbgl-t-main-shift-y: 3px;
                            --bbgl-t-gap: 2.625px;
                            --bbgl-t-gap-v: 1.8125px;
                            --bbgl-t-block-gap: 1.359375px;
                            --bbgl-t-corner-shift-y: 2.5px;
                            --bbgl-t-corner-vgap: 2.70084px;

                            --bbgl-t-win-pad: 6px;
                            --bbgl-t-win-pad-y: 2.25px;
                            --bbgl-t-win-radius: 5.625px;

                            --bbgl-t-rank-h: 53.5px;
                            --bbgl-t-rank-tag-pad-x: 2.5px;
                            --bbgl-t-rank-tag-cut: 1.1146px;
                            --bbgl-t-display-w: 23.5px;
                            --bbgl-t-display-fs: 8.5px;

                            --bbgl-t-star: 15px;
                            --bbgl-t-star-cgap: 1.6875px;

                            /* cqb on this element previously fell back to viewport height because a
                               container cannot query its own block size. Freeze the captured result
                               explicitly so page height/scroll length has no sizing effect. */
                            gap: 9.88877px;
                        }

                        /* This tier is the only one that shrinks the identity board TWICE — once
                           through the page-level values above, then again here. The 386-783px tier
                           overrides nothing but width, so the narrowest page was the one place the
                           board took a second reduction on top of an already-reduced set, which is
                           what made it read as undersized rather than merely small.

                           These pull that second reduction roughly halfway back toward the page-level
                           numbers, with the width moved up alongside so the larger type has somewhere
                           to wrap (the composed title wraps freely inside this box, so raising the
                           type without the width just buys taller lines rather than bigger ones).
                           These four are the knobs for how big the board reads at this width. */
                        #bbgl-panel.bbgl-mode-page .bbgl-titles-center {
                            width: 82px;
                            --bbgl-t-fs-name: 10.75px;
                            --bbgl-t-name-scale: 1.38;
                            --bbgl-t-fs-line: 8.25px;
                            --bbgl-t-fs-line-label: 6.375px;
                            --bbgl-t-gap: 2.125px;
                            --bbgl-t-gap-v: 1.3125px;
                            --bbgl-t-win-pad: 5.125px;
                            --bbgl-t-win-radius: 4.875px;
                        }

                        #bbgl-panel.bbgl-mode-page .bbgl-titles-name {
                            max-width: 222.919px;
                        }

                    }

                    @container bbgl-page (min-width:386px) and (max-width:783px) {
                        #bbgl-panel.bbgl-mode-page .bbgl-titles-page {
                            --bbgl-t-fs-name: 11.25px;
                            --bbgl-t-name-scale: 1.45;
                            --bbgl-t-fs-line: 8.75px;
                            --bbgl-t-fs-line-label: 6.625px;
                            --bbgl-t-fs-notch: 8.25px;
                            --bbgl-t-fs-label: 7.25px;
                            --bbgl-t-fs-block-label: 11.25px;
                            --bbgl-t-label-clear: 11.25px;
                            --bbgl-t-stack-frame-offset: 11.25px;

                            --bbgl-t-cards-lift: 5px;
                            --bbgl-t-main-shift-y: 3px;
                            --bbgl-t-gap: 2.625px;
                            --bbgl-t-gap-v: 1.8125px;
                            --bbgl-t-block-gap: 1.359375px;
                            --bbgl-t-corner-shift-y: 2.5px;
                            --bbgl-t-corner-vgap: 2px;

                            --bbgl-t-win-pad: 6.875px;
                            --bbgl-t-win-pad-y: 3.625px;
                            --bbgl-t-win-radius: 5.875px;

                            --bbgl-t-rank-h: 56.4px;
                            --bbgl-t-rank-tag-pad-x: 2.69117px;
                            --bbgl-t-rank-tag-cut: 1.3456px;
                            --bbgl-t-display-w: 23.5px;
                            --bbgl-t-display-fs: 8.5px;

                            --bbgl-t-star: 18.5px;
                            --bbgl-t-star-cgap: 2.0625px;
                            gap: 9.88877px;
                        }

                        #bbgl-panel.bbgl-mode-page .bbgl-titles-center {
                            width: 82.5px;
                        }

                        #bbgl-panel.bbgl-mode-page .bbgl-titles-corner-col {
                            --bbgl-t-win-pad: 7.75px;
                            --bbgl-t-win-pad-y: 2.875px;
                            --bbgl-t-win-radius: 6.625px;
                        }

                    }

                    @container bbgl-page (min-width:784px) {
                        #bbgl-panel.bbgl-mode-page .bbgl-titles-page {
                            --bbgl-t-fs-name: 17px;
                            --bbgl-t-name-scale: 1.4;
                            --bbgl-t-fs-line: 12.25px;
                            --bbgl-t-fs-line-label: 9px;
                            --bbgl-t-fs-notch: 12px;
                            --bbgl-t-fs-label: 10px;
                            --bbgl-t-fs-block-label: 12.5px;
                            --bbgl-t-label-clear: 12px;
                            --bbgl-t-stack-frame-offset: 12px;

                            --bbgl-t-cards-lift: 6px;
                            --bbgl-t-main-shift-y: 29px;
                            --bbgl-t-gap: 4.625px;
                            --bbgl-t-gap-v: 3px;
                            --bbgl-t-block-gap: 2.25px;
                            --bbgl-t-corner-shift-y: 3px;
                            --bbgl-t-corner-vgap: 4.5px;

                            --bbgl-t-win-pad: 8.5px;
                            --bbgl-t-win-pad-y: 4.25px;
                            --bbgl-t-win-radius: 8.5px;

                            --bbgl-t-rank-h: 109.128px;
                            --bbgl-t-rank-tag-pad-x: 5.47717px;
                            --bbgl-t-rank-tag-cut: 2.7386px;
                            --bbgl-t-display-w: 34px;
                            --bbgl-t-display-fs: 13px;

                            --bbgl-t-star: 28px;
                            --bbgl-t-star-cgap: 3.75px;
                            gap: 11.5369px;
                        }

                        #bbgl-panel.bbgl-mode-page .bbgl-titles-center {
                            width: 114px;
                        }

                        #bbgl-panel.bbgl-mode-page .bbgl-titles-corner-col {
                            --bbgl-t-corner-vgap: 2px;
                            --bbgl-t-win-pad-y: 3.25px;
                        }

                    }

                    /* Expanded uses one 300-500px cqi window for both the identity and stat cards.
                       At 300px every component is at its compact-safe floor; at 500px the title type,
                       crowns, labels, padding, internal gaps and radius all reach their expanded
                       maxima together. Above 500px they hold steady through the 576px cap. */
                    #bbgl-panel.bbgl-expanded .bbgl-titles-page {
                        /* Locked, like the centre card's width. .bbgl-titles-name is the only thing
                           reading it, and that sign is absolutely positioned at zero height, so its
                           size feeds no layout — letting it track the width bought nothing and just
                           made the marquee shrink alongside everything else. */
                        --bbgl-t-fs-name: 18px;
                        --bbgl-t-name-scale: 1.3;
                        --bbgl-t-fs-line: clamp(7.2px, 2.6cqi, 13px);
                        --bbgl-t-fs-line-label: clamp(5.6px, 2cqi, 10px);
                        --bbgl-t-fs-label: 9px;
                        --bbgl-t-fs-block-label: clamp(7.8px, 2.6cqi, 13px);
                        --bbgl-t-stack-frame-offset: calc(clamp(7.2px, 2.6cqi, 13px) * .6 + 2px + 2.5px);
                        --bbgl-t-gap: clamp(2.1px, .7cqi, 3.5px);
                        /* A real visual offset on .bbgl-titles-main, independent of flex sizing.
                           Unlike the shared negative margin, this cannot be absorbed while flexbox
                           redistributes the main row's available height. */
                        --bbgl-t-main-shift-y: 2px;
                        --bbgl-t-rank-card-overhang: 6px;

                        /* Board height. .bbgl-titles-main's own box does not change in this mode —
                           the panel's height is fixed and --bbgl-t-rank-h reads cqb — so stating the
                           row as a share of it gives the identity board a height that HOLDS as the
                           browser narrows, instead of tracking the stat stacks down. Sized past what
                           the stacks alone would have set, which is what reaches into the space that
                           used to sit empty between the cards and the rank bar.

                           Raised alongside the card getting narrower, so it trades width for height
                           rather than simply losing presence — a taller, slimmer plaque rather than
                           a smaller one. */
                        --bbgl-t-board-h: 94%;
                        /* The MINIMUM gap a stat card keeps once everything else has closed up. This
                           value is the floor against the centre card; the wall gets double it.

                           Both are ramped on (1 - -cards), so they are worth zero at default and
                           only materialise as the cards begin to shrink. That is deliberate: they
                           are floors, and a floor reserved at default is not a floor, it is just
                           width taken off the fr tracks — which shows up as SMALLER visible gaps
                           everywhere, since a centred column splits its track's slack evenly and
                           half of anything reserved comes out of the inner side. Ramping them keeps
                           the roomy default exactly as it was and still guarantees the 2:1 at the
                           tight end, where it is the only thing standing between the cards and
                           their neighbours. */
                        --bbgl-t-corner-hgap: 14px;
                        /* Where the stat cards stop holding and start shrinking, as a share of the
                           width range. Above it the grid's own fr tracks still have slack to give
                           (see the note where -corner-gap used to be), so the cards keep full size
                           and only the space around them closes; below it that slack is gone down to
                           -corner-hgap and the cards are the only thing left to give.
                           This has to sit slightly BEFORE the width at which a track narrows to its
                           own column, or the last of the gap goes first and the cards start moving
                           from nothing — which is what .45 did. ESTIMATED from the stat blocks'
                           rendered width at full size against the centre card's fixed 120px plus the
                           reserved gaps, not measured: if a visible gap still disappears before the
                           cards react, raise it further. */
                        --bbgl-t-cards: clamp(0, calc(var(--bbgl-t-w) / .60), 1);
                        /* -corner-shift-y stays at expanded's original value (not part of this
                           change). -cards-lift reuses page mode's clamp shape since both modes query
                           similar vertical room — retune independently later if expanded needs its
                           own numbers. */
                        --bbgl-t-corner-shift-y: clamp(6px, 1.5cqb, 14px);
                        --bbgl-t-cards-lift: clamp(6px, 1.4cqb, 14px);
                        /* The one lever that puts a narrowing panel's freed HEIGHT back to work.
                           Expanded is the mode that needs it: its panel height is fixed, so only the
                           width ever moves, and narrowing shrinks the stars and card type — roughly
                           50px of stack height handed back — while the box holding it stays exactly
                           as tall. Bottom-anchoring the rank bar (see -rank-bias) stopped that height
                           leaking away downward; this is what spends it.

                           It spends it TWICE from one number, because of how the grid row is sized:
                           growing this pushes a column's two stat cards apart, the taller stack sets
                           the row, and .bbgl-titles-center is align-self:stretch inside that row with
                           a .bbgl-title-card that is flex:1 1 auto / height:100% — so the identity
                           board grows by the same amount, with no second value to keep in sync.

                           The narrow term must stay well UNDER the height narrowing frees, since it
                           is spending exactly that: at 16px against ~50px freed the stack still nets
                           shorter at every width, which is what guarantees this cannot overflow the
                           page's hidden overflow no matter how the cards are retuned later.

                           Now only a FLOOR, not the compensation itself. The columns are stretched
                           and space-between in this mode (see .bbgl-titles-corner-col below), so the
                           gap between the two cards is already whatever the row height leaves over
                           and grows on its own as they shrink. This just stops them touching if the
                           row is ever short enough that there is nothing left to distribute. */
                        --bbgl-t-corner-vgap: clamp(2px, .5cqb, 4px);

                        /* Lets clearance around the centre card compress further before crown sizing
                           responds, while keeping the same continuous shrink-to-fit behaviour as
                           other modes. 5cqi reaches the 25px cap at 500px, then eases down to
                           protect the centre card at narrower widths. */
                        --bbgl-t-star: clamp(15px, 5cqi, 25px);
                        --bbgl-t-star-cgap: clamp(1.8px, .6cqi, 3px);

                        --bbgl-t-win-pad: clamp(3.6px, 1.2cqi, 6px);
                        --bbgl-t-win-pad-y: clamp(3px, .92cqi, 4.6px);
                        --bbgl-t-win-radius: clamp(5px, 1.6cqi, 8px);
                        --bbgl-t-win-glow: .9;

                        /* Gives a little of the rank row back as the panel narrows, which is what
                           lets the board grow DOWNWARD without any downward term of its own: this is
                           the board's sibling, the board is flex:1 1 auto, and the board's top edge
                           does not move — so every pixel released here is taken on at the bottom.

                           The room is real, not borrowed: --bbgl-t-fs-notch shrinks the rank titles
                           over this same range (~3px per line, two lines), so the labels this row
                           reserves space for are getting shorter by more than the 8px handed back.

                           max() before the subtraction because 8cqb sits below the old 50px floor at
                           this mode's height, so the value was pinned there — subtracting inside a
                           plain clamp would have dropped it straight to the new floor at every width
                           instead of easing down. */
                        --bbgl-t-rank-h: clamp(42px, calc(max(50px, 8cqb) - 8px * var(--bbgl-t-narrow)), 62px);
                        --bbgl-t-rank-tag-pad-x: clamp(3px, .6cqi, 5px);
                        --bbgl-t-display-w: clamp(24px, 4.8cqi, 30px);
                        --bbgl-t-display-fs: clamp(9px, 1.8cqi, 11px);
                    }

                    /* Compact, in full. Fixed px throughout — its width never changes, so there is
                       nothing to respond to — and smaller across the board because the card and grid
                       are competing for far less height: the card shrinks so the stars don't have to.
                       Same 5-over-5 star rows as every other mode — stars just run smaller, since
                       compact's block has no room to spare. */
                    #bbgl-panel.bbgl-compact .bbgl-titles-page {
                        --bbgl-t-fs-name: 11px;
                        --bbgl-t-name-scale: 1.29;
                        --bbgl-t-fs-line: 8px;
                        --bbgl-t-fs-line-label: 6px;
                        --bbgl-t-fs-notch: 7px;
                        --bbgl-t-fs-label: 5px;
                        --bbgl-t-fs-block-label: 8px;
                        --bbgl-t-stack-frame-offset: calc(8.5px * .6 + 2px + 2.5px);

                        --bbgl-t-gap: 3px;
                        --bbgl-t-gap-v: 3px;
                        --bbgl-t-block-gap: 1px;
                        --bbgl-t-corner-shift-y: 4px;
                        --bbgl-t-rank-card-overhang: 8px;
                        --bbgl-t-cards-lift: 0px;
                        --bbgl-t-corner-vgap: 0px;
                        --bbgl-t-main-pb: 0px;

                        --bbgl-t-rank-h: 46.6px;
                        --bbgl-t-rank-tag-pad-x: 2px;
                        --bbgl-t-rank-tag-pad-y: 1px;
                        --bbgl-t-rank-tag-cut: 1px;
                        --bbgl-t-bar-h: 1px;
                        --bbgl-t-display-w: 22px;
                        --bbgl-t-display-fs: 8px;
                        /* Tighter than the shared value: compact's rank area is the narrowest in the
                           app, so it buys back a little groove length at the ends. */
                        --bbgl-t-rank-edge: 4px;
                        /* Thinner than the 1px tick width: at compact's scale a full 1px groove
                           reads heavier than the ticks hanging off it. */
                        --bbgl-t-groove-h: .75px;
                        /* Compact-only compression buys back the pixels used by the coordinated
                           downward nudge in layoutRankBarCenter(). */
                        --bbgl-t-tick-h-override: 3px;
                        --bbgl-t-slider-tick-h-override: 1.5px;
                        --bbgl-t-slider-tick-grow-override: .5px;
                        --bbgl-t-slider-gap: 1px;
                        --bbgl-t-knob-lh: .9;
                        --bbgl-t-rank-nudge-y: 4px;
                        --bbgl-t-rank-label-drop: 2px;
                        --bbgl-t-rank-floor: 2px;

                        --bbgl-t-star: 13px;
                        --bbgl-t-star-cgap: 1px;
                        --bbgl-t-reset: 9px;

                        --bbgl-t-win-pad: 3px;
                        --bbgl-t-win-pad-y: 3px;
                        --bbgl-t-win-radius: 5px;
                        --bbgl-t-win-glow: .65;
                    }

                    /* Stat-card-only mode refinements. Compact gets one small fixed-size step up
                       without enlarging its identity card. Expanded keeps the synchronized cqi
                       slopes and maxima above, but its stat cards alone may continue to slightly
                       smaller floors when the resizable panel drops below the normal 300px width. */
                    #bbgl-panel.bbgl-compact .bbgl-titles-corner-col {
                        --bbgl-t-star: 14px;
                        --bbgl-t-star-cgap: 1.2px;
                        --bbgl-t-fs-block-label: 8.5px;
                        --bbgl-t-label-clear: calc(var(--bbgl-t-fs-block-label) * .6 + 2px + 2.5px);
                        --bbgl-t-win-pad: 3.25px;
                        --bbgl-t-win-pad-y: 4px;
                        --bbgl-t-win-radius: 5.5px;
                    }

                    /* Every endpoint here is unchanged; what changed is WHEN they travel. These were
                       raw cqi, so a stat card started shrinking on the first pixel of narrowing — at
                       the same time as the space around it, rather than after it. On -cards they
                       hold their full size while the grid's fr tracks close, then run to the same
                       floors they always had over what is left of the range. */
                    #bbgl-panel.bbgl-expanded .bbgl-titles-corner-col {
                        --bbgl-t-star: clamp(14px, calc(14px + 11px * var(--bbgl-t-cards)), 25px);
                        --bbgl-t-star-cgap: clamp(1.5px, calc(1.5px + 1.5px * var(--bbgl-t-cards)), 3px);
                        --bbgl-t-fs-block-label: clamp(8.5px, calc(8.5px + 3px * var(--bbgl-t-cards)), 11.5px);
                        --bbgl-t-label-clear: calc(var(--bbgl-t-fs-block-label) * .6 + 2px + 2.5px);
                        --bbgl-t-win-pad: clamp(3.25px, calc(3.25px + 2.75px * var(--bbgl-t-cards)), 6px);
                        --bbgl-t-win-pad-y: clamp(1.8px, calc(1.8px + 1.2px * var(--bbgl-t-cards)), 3px);
                        --bbgl-t-win-radius: clamp(4.5px, calc(4.5px + 3.5px * var(--bbgl-t-cards)), 8px);
                    }

                    /* Everything but the rank track: three columns (str+spd left, identity card
                       middle, def+dex right). The two side columns are equal (minmax(0,1fr)) and
                       centre their own card; the middle column is 'auto' — sized to the identity
                       card's own intrinsic width rather than forced into an equal third, since a
                       side column's card can change size and just stays centred in its own equal
                       half with no retuning needed.

                       An 'auto' middle track only sizes to content that's actually IN FLOW — the
                       dual-sign assembly stays a normal grid item; only the player name above it
                       may overhang without affecting width.

                       Not centred vertically as a whole grid, on request: the rank track below is a
                       sibling, not a grid row, so its height never skews where "vertical centre"
                       would land for the cards above it. The corner columns contribute their
                       intrinsic two-card stack height to the single centred grid row; the identity
                       card stretches through that same row, so its frame shares the stack's exact
                       top and bottom edges. */
                    .bbgl-titles-main {
                        position: relative;
                        top: var(--bbgl-t-main-shift-y, 0px);
                        display: grid;
                        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
                        align-items: stretch;
                        align-content: center;
                        /* Drops the cards (stat columns and identity card alike) without touching
                           the rank bar below, which is this element's sibling and stays pinned to
                           the bottom edge on its own, independent of this margin.

                           margin, not padding, specifically so this can go NEGATIVE and pull the
                           cards up as well as push them down: a negative padding is invalid CSS
                           and would be dropped silently, leaving the knob dead in one direction
                           with no error to explain why. */
                        margin-top: var(--bbgl-t-cards-drop, 0px);
                        padding-bottom: var(--bbgl-t-main-pb);
                        flex: 1 1 auto;
                        width: 100%;
                        min-width: 0;
                        min-height: 0;
                        /* Load-bearing next to width:100%. There is no universal box-sizing reset in
                           this file, so without this any horizontal padding lands OUTSIDE the 100%:
                           the box becomes wider than its parent, overflows to the right, and its
                           content box — everything the grid centres against — ends up offset by half
                           that overflow, which reads as the whole card row sitting off-centre. */
                        box-sizing: border-box;
                    }

                    /* Explicit placement rather than DOM-order auto-flow, purely for clarity/safety
                       here — all three children are in-flow now, so auto-flow would in fact land them
                       in the right columns on its own, but pinning it explicitly means a future
                       markup reorder can't silently scramble the layout. */
                    .bbgl-titles-corner-col:first-child {
                        grid-column: 1;
                        justify-self: center;
                    }

                    .bbgl-titles-corner-col:last-child {
                        grid-column: 3;
                        justify-self: center;
                    }

                    /* Expanded pins its stat cards to the corners rather than centring them as a
                       pair. Stretching the column to the row gives space-between something to
                       distribute, so the top card holds the top edge and the bottom card holds the
                       bottom edge — as the cards shrink they stay put and the space OPENS BETWEEN
                       them, instead of the pair collapsing toward its own middle and leaving the
                       corners empty.

                       That also means the vertical compensation is structural here: the gap between
                       the two cards is simply whatever the shrinking left over, so nothing has to
                       compute it. --bbgl-t-corner-vgap keeps acting as the floor under it. Both
                       columns and the identity card are align-self:stretch on the same row, so all
                       three share one top and bottom edge. */
                    #bbgl-panel.bbgl-expanded .bbgl-titles-corner-col {
                        align-self: stretch;
                        justify-content: space-between;
                    }

                    /* One intrinsic stat stack. Its two cards and responsive gap establish the grid
                       row's height; the centre billboard then stretches to exactly that measurement.
                       -corner-shift-y moves the completed stack without changing that geometry. */
                    .bbgl-titles-corner-col {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        gap: var(--bbgl-t-corner-vgap);
                        flex: 0 0 auto;
                        min-width: 0;
                        align-self: center;
                        transform: translateY(calc(var(--bbgl-t-corner-shift-y) - var(--bbgl-t-cards-lift)));
                    }

                    /* ─── Identity block ─────────────────────────────────────────────
                       A normal in-flow grid item — has to be, so .bbgl-titles-main's 'auto' middle
                       column can size itself off this card's own intrinsic width (out-of-flow items
                       are invisible to grid track sizing). align-self:stretch makes the wrapper
                       consume the row height the stat stacks establish; its translateY uses the
                       exact same net offset as both columns, so the plaque and hanging sign keep a
                       shared top edge, bottom edge and centreline as shift/lift values change. */
                    /* Plain layout wrapper for the centre column. Its dimensions come only from the
                       in-flow dual-sign assembly. The player name is absolutely centred above it, so
                       a long name cannot widen the grid track or displace the stat columns. Purple
                       custom properties now drive that player-name neon alone. */
                    .bbgl-titles-center {
                        --bbgl-t-win-color: #a855f7;
                        --bbgl-t-win-glow: 1.3;
                        --bbgl-t-win-hum: 11.3s;
                        --bbgl-t-wire-h: 6px;
                        --bbgl-t-wire-lift: 4px;
                        position: relative;
                        grid-column: 2;
                        justify-self: center;
                        align-self: stretch;
                        transform: translateY(calc(var(--bbgl-t-corner-shift-y) - var(--bbgl-t-cards-lift)));
                        z-index: 2;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        width: clamp(86px, 19cqi, 132px);
                        margin-top: var(--bbgl-t-stack-frame-offset);
                        min-width: 0;
                        max-width: 100%;
                    }

                    /* On -cards, NOT on the raw width ratio, and that distinction is the whole point.
                       The centre column is the grid's only 'auto' track, so through stage one this
                       has to stay put: a definite centre track is what gives the two fr tracks
                       something to yield and an order to yield it in. Let it track the width instead
                       and it would shrink alongside the space around it, and there would be no "gap
                       closes first" left to speak of.

                       Once the gap IS spent and the stat cards start shrinking, it comes along with
                       them, so the card narrows with its neighbours rather than standing at full
                       width while they give way around it.

                       120 at the top is the default and stays that, since the default already had
                       the room; only the 92 floor is new. Height is where this mode gains instead —
                       see --bbgl-t-board-h.

                       Worth knowing before tuning: this and the gap reservations act on the same fr
                       tracks in opposite directions, so they cancel 1:1. Widening the card by 28px
                       is the same as removing 28px of reservation, and each closes the other's gain.
                       Both are already ramped to stay out of the way at default, so if the stat
                       cards need genuine relief at the narrow end, this floor and -corner-hgap are
                       the two places the width can come from. */
                    #bbgl-panel.bbgl-expanded .bbgl-titles-center {
                        width: clamp(92px, calc(92px + 28px * var(--bbgl-t-cards)), 120px);
                    }

                    /* The row is stated as a share of the board's box rather than left to the stat
                       stacks' intrinsic height, so the identity card reaches into the space below it
                       and — since this mode's box height does not move — keeps that height as the
                       browser narrows. align-content:center on the base rule centres the row.

                       The two gap reservations are what stop the stat cards ever touching the wall
                       or the centre card. Both come out of the grid's width BEFORE the fr tracks are
                       sized, so they are not slack and cannot be consumed no matter how far the
                       panel narrows: column-gap holds the card off the centre, padding-inline holds
                       it off the wall, and the column's own justify-self:center keeps whatever
                       remains split evenly between the two. Taking them off the tracks also brings
                       the width at which a track meets its column further out, which is exactly
                       where -cards is set to start shrinking. */
                    #bbgl-panel.bbgl-expanded .bbgl-titles-main {
                        grid-template-rows: var(--bbgl-t-board-h, 88%);
                        column-gap: calc(var(--bbgl-t-corner-hgap) * (1 - var(--bbgl-t-cards)));
                        padding-inline: calc(var(--bbgl-t-corner-hgap) * 2 * (1 - var(--bbgl-t-cards)));
                    }

                    #bbgl-panel.bbgl-compact .bbgl-titles-center {
                        width: 82px;
                    }

                    /* The suspended sign: name plus the rods it hangs from. Absolutely centred on
                       the identity wrapper and pinned to zero height, so only the box below decides
                       middle-track width and vertical centring; width:max-content still measures
                       the name for drawing even though it contributes nothing to the grid.

                       Zero height means content would spill DOWNWARD, so .bbgl-titles-sign-inner
                       lifts it back up by its own height via translateY (not top/bottom — a
                       percentage there resolves against the containing block's height, which is 0
                       here, where translateY resolves against the element's OWN height). Because
                       the lift is by the inner wrapper's own height, growing the rods
                       (--bbgl-t-wire-h) raises the name by the same amount for free — one number
                       moves both.

                       The assembly stays exactly as wide as the billboard; only .bbgl-titles-name
                       may overhang that width, protected by its own cap and ellipsis. */
                    .bbgl-titles-sign {
                        position: absolute;
                        top: 0;
                        left: 50%;
                        transform: translateX(-50%);
                        height: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        width: 100%;
                        pointer-events: none;
                    }

                    /* The compact sign keeps the requested small downward bias; the new short
                       mounts let that bias bring the tubing almost onto the billboard frame. */
                    #bbgl-panel.bbgl-compact .bbgl-titles-sign {
                        top: 1px;
                    }

                    .bbgl-titles-sign-inner {
                        transform: translateY(-100%);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        width: 100%;
                        min-width: 0;
                    }

                    /* line-height and the padding leave room for descenders — at 1.05 with the
                       page's overflow:hidden the bottom of the name was being shaved off. It remains
                       a neon sign lifted above the new rank-plaque/title-sign assembly; the shared
                       purple custom properties now belong to this name alone. */
                    .bbgl-titles-name {
                        /* Neonderthaw, not the stat labels' Dancing Script: both are connected
                           scripts standing in for bent glass, but they're built for opposite ends
                           of the size range. Dancing Script is drawn to survive 8-12px (the block
                           labels' size) and reads floppy blown up to marquee scale; Neonderthaw is
                           drawn as neon tubing outright - near-uniform stroke width, tube-like
                           joins - which only resolves large, exactly where this sits. Glow recipe
                           is still the shared one: near-white core, colour in the bloom, three
                           stacked shadows for a falloff rather than one smudged blur. */
                        font-family: 'Neonderthaw', 'Dancing Script', 'Segoe Script', 'Brush Script MT', cursive;
                        font-size: calc(var(--bbgl-t-fs-name) * var(--bbgl-t-name-scale, 1.45));
                        font-weight: 400;
                        line-height: 1.15;
                        padding-bottom: .1em;
                        color: color-mix(in srgb, var(--bbgl-t-win-color) 30%, #fff);
                        text-shadow:
                            0 0 1px color-mix(in srgb, var(--bbgl-t-win-color) 45%, #fff),
                            0 0 calc(4px * var(--bbgl-t-win-glow, 1)) color-mix(in srgb, var(--bbgl-t-win-color) 80%, transparent),
                            0 0 calc(10px * var(--bbgl-t-win-glow, 1)) color-mix(in srgb, var(--bbgl-t-win-color) 60%, transparent),
                            0 0 calc(20px * var(--bbgl-t-win-glow, 1)) color-mix(in srgb, var(--bbgl-t-win-color) 40%, transparent),
                            0 0 calc(34px * var(--bbgl-t-win-glow, 1)) color-mix(in srgb, var(--bbgl-t-win-color) 22%, transparent);
                        animation: bbgl-neon-hum var(--bbgl-t-win-hum, 11.3s) ease-in-out infinite;
                        animation-delay: var(--bbgl-titles-animation-delay, 0ms);
                        position: relative;
                        z-index: 1;
                        width: max-content;
                        /* The billboard is intentionally narrow now, so its width cannot also be
                           the name's clipping boundary. Let the tubing use the surrounding panel
                           while keeping a hard guard against reaching the outer stat columns. */
                        max-width: min(260px, 70cqi);
                        box-sizing: border-box;
                        /* overflow:hidden (needed for the ellipsis on long names) clips at the
                           element's box, but a script face's last glyph sweeps PAST its own
                           advance width - and the neon bloom extends further still - so both were
                           being sheared off flat on the right. The inline padding buys that
                           overhang room inside the box before the clip lands. */
                        padding-left: .38em;
                        padding-right: .38em;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    /* The standoffs holding the sign off the box: two thin glowing rods running
                       from the underside of the name down to the window's top edge. Same line
                       colour and glow falloff as the window's own tube, so the sign reads as
                       mounted to it rather than as a separate floating object. A real element in
                       the flex column (not a pseudo on either neighbour) so it claims its own
                       layout height between the two - that height IS the gap, which is why
                       .bbgl-titles-center has no row-gap of its own. */
                    .bbgl-titles-wires {
                        position: relative;
                        /* Under the lettering: the rods run up behind the glyphs rather than
                           crossing over them, so the sign reads as mounted in front of its
                           hardware (and the negative margin above can overlap freely). */
                        z-index: 0;
                        width: 42%;
                        height: var(--bbgl-t-wire-h, 18px);
                        /* Pulled up into the name's own line box. A text element's box bottom sits
                           well below where the letters visually end (descender space the glyphs
                           don't reach), so wires starting at the box edge read as floating in a
                           gap rather than attached to the lettering - the overlap closes that. */
                        margin-top: calc(var(--bbgl-t-wire-lift, 8px) * -1);
                        pointer-events: none;
                    }

                    /* Unlit hardware, deliberately NOT part of the tube: a cross-bar gradient
                       (dark edge -> bright off-centre highlight -> dark edge) is what reads as a
                       round metal rod rather than a flat line, so these look like the mounts the
                       sign hangs from instead of more neon. Needs real width for that gradient to
                       resolve - a 1px rod has nowhere to put a highlight. The only glow they carry
                       is a faint tint of the sign's colour spilling ONTO them from above, which is
                       what ties them to the lit letters without making them lit themselves. */
                    .bbgl-titles-wires::before,
                    .bbgl-titles-wires::after {
                        content: '';
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        width: 3px;
                        border-radius: 1px;
                        background:
                            linear-gradient(90deg,
                                #050505 0%,
                                #2b2b2b 22%,
                                #5a5a5a 42%,
                                #3a3a3a 60%,
                                #171717 82%,
                                #030303 100%);
                        box-shadow:
                            0 0 1px rgba(0, 0, 0, .45),
                            inset 0 0 1px rgba(255, 255, 255, .12);
                        filter: drop-shadow(0 0 3px color-mix(in srgb, var(--bbgl-t-win-color) 18%, transparent));
                    }

                    .bbgl-titles-wires::before {
                        left: 0;
                    }

                    .bbgl-titles-wires::after {
                        right: 0;
                    }

                    /* Article sits deliberately quieter than the words it introduces. */
                    .bbgl-titles-the {
                        color: rgba(255, 255, 255, .55);
                        font-weight: 600;
                    }

                    .bbgl-title-card {
                        --bbgl-title-label-size: calc(var(--bbgl-t-fs-line-label) * .8);
                        --bbgl-title-connector-space: calc(var(--bbgl-title-label-size) + 2px);
                        position: relative;
                        isolation: isolate;
                        display: grid;
                        grid-template-rows: minmax(0, 40%) 4px minmax(0, 1fr);
                        justify-items: center;
                        align-items: stretch;
                        flex: 1 1 auto;
                        width: 100%;
                        height: 100%;
                        min-width: 0;
                        min-height: 0;
                        padding: 0 0 4px;
                        border: 1px solid #140b07;
                        border-radius: 3px;
                        box-sizing: border-box;
                        /* Dark walnut: deep cool chocolate base, darker grain streaks, faint light figure. */
                        background:
                            repeating-linear-gradient(92deg, transparent 0 5px, rgba(8, 4, 2, .28) 6px, transparent 7px 13px),
                            repeating-linear-gradient(88deg, rgba(176, 128, 92, .04) 0 1px, transparent 1px 3px),
                            radial-gradient(ellipse 28% 120% at 24% 35%, #3a241800 45%, #140a0666 70%, transparent 78%),
                            linear-gradient(100deg, #24160f, #3d281d 38%, #2f1e15 72%, #20140d);
                        box-shadow:
                            inset 1px 1px 0 rgba(186, 138, 100, .22),
                            inset -1px -1px 0 rgba(0, 0, 0, .7),
                            inset 0 0 0 3px rgba(16, 8, 4, .28);
                    }

                    .bbgl-title-card::before {
                        content: none;
                        position: absolute;
                        inset: 0;
                        z-index: -2;
                        border: 1px solid color-mix(in srgb, var(--bbgl-t-win-color) 38%, rgba(255, 255, 255, .96));
                        border-radius: inherit;
                        pointer-events: none;
                        filter:
                            drop-shadow(0 0 1px color-mix(in srgb, var(--bbgl-t-win-color) 55%, #fff))
                            drop-shadow(0 0 calc(4px * var(--bbgl-t-win-glow)) color-mix(in srgb, var(--bbgl-t-win-color) 55%, transparent))
                            drop-shadow(0 0 calc(11px * var(--bbgl-t-win-glow)) color-mix(in srgb, var(--bbgl-t-win-color) 26%, transparent));
                        animation: bbgl-neon-hum var(--bbgl-t-win-hum, 8s) ease-in-out infinite;
                        animation-delay: var(--bbgl-titles-animation-delay, 0ms);
                    }

                    .bbgl-title-card::after {
                        content: none;
                        position: absolute;
                        inset: 1px;
                        z-index: -1;
                        border-radius: inherit;
                        pointer-events: none;
                        background:
                            radial-gradient(ellipse 118% 118% at 50% 50%, transparent 34%, color-mix(in srgb, var(--bbgl-t-win-color) 13%, transparent) 100%),
                            repeating-linear-gradient(0deg, transparent 0 2px, color-mix(in srgb, var(--bbgl-t-win-color) 9%, transparent) 2px 4px);
                        -webkit-mask-image: radial-gradient(ellipse 130% 130% at 50% 50%, rgba(0, 0, 0, .25) 20%, #000 100%);
                        mask-image: radial-gradient(ellipse 130% 130% at 50% 50%, rgba(0, 0, 0, .25) 20%, #000 100%);
                    }

                    .bbgl-title-card-rank {
                        position: relative;
                        z-index: 3;
                        display: flex;
                        align-items: stretch;
                        justify-content: center;
                        width: calc(100% - 12px);
                        height: 100%;
                        min-width: 0;
                        min-height: 0;
                    }

                    .bbgl-title-card-rank-label,
                    .bbgl-title-card-title-label {
                        position: absolute;
                        left: 50%;
                        z-index: 4;
                        transform: translateX(-50%);
                        font-family: Consolas, Menlo, 'DejaVu Sans Mono', monospace;
                        font-size: var(--bbgl-t-fs-line-label);
                        font-weight: 700;
                        line-height: 1;
                        letter-spacing: .14em;
                        text-transform: uppercase;
                        color: rgba(207, 214, 214, .58);
                        text-shadow: 0 1px 1px rgba(0, 0, 0, .9);
                        white-space: nowrap;
                        pointer-events: none;
                    }

                    .bbgl-title-card-rank-label {
                        top: 0;
                        padding: 0 .45em;
                        transform: translateX(-50%);
                        background: transparent;
                    }

                    .bbgl-title-card-connector {
                        position: relative;
                        z-index: 3;
                        align-self: stretch;
                        width: 58%;
                        min-height: 0;
                        margin: -1px 0;
                        pointer-events: none;
                    }

                    .bbgl-title-card-connector::before,
                    .bbgl-title-card-connector::after {
                        content: none;
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        width: 2px;
                        border-radius: 1px;
                        background: linear-gradient(90deg, #090a0b, #73797a 43%, #292d2e 66%, #08090a);
                        box-shadow:
                            inset 0 0 1px rgba(255, 255, 255, .18),
                            0 1px 1px rgba(0, 0, 0, .8);
                    }

                    .bbgl-title-card-connector::before { left: 0; }
                    .bbgl-title-card-connector::after { right: 0; }

                    .bbgl-title-card-title-label {
                        position: relative;
                        top: auto;
                        left: auto;
                        transform: none;
                        flex: 0 0 auto;
                        font-family: Georgia, 'Times New Roman', serif;
                        font-size: min(10cqw, 17cqh);
                        font-style: italic;
                        font-weight: 500;
                        line-height: 1;
                        letter-spacing: .02em;
                        text-transform: none;
                        color: #f6dc98;
                        text-shadow: 0 1px 1px rgba(38, 8, 52, .82);
                    }

                    .bbgl-title-card-sign {
                        container-type: size;
                        position: relative;
                        z-index: 4;
                        top: -1px;
                        align-self: stretch;
                        width: 116.505%;
                        height: calc(100% + 1px);
                        min-width: 0;
                        min-height: 0;
                        box-sizing: border-box;
                        filter: drop-shadow(0 3px 2px rgba(0, 0, 0, .65));
                    }

                    .bbgl-title-card-sign-face {
                        position: relative;
                        isolation: isolate;
                        display: flex;
                        flex-direction: column;
                        gap: .75cqh;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 100%;
                        min-width: 0;
                        min-height: 0;
                        padding: 10cqh 19% 17cqh;
                        box-sizing: border-box;
                    }

                    .bbgl-title-card-sign-face::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%204%20240%2096%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22face%22%20x2%3D%22.2%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23363735%22%2F%3E%3Cstop%20offset%3D%22.45%22%20stop-color%3D%22%23262826%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23171917%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22side%22%3E%3Cstop%20stop-color%3D%22%23101210%22%2F%3E%3Cstop%20offset%3D%22.35%22%20stop-color%3D%22%2330332f%22%2F%3E%3Cstop%20offset%3D%22.7%22%20stop-color%3D%22%23242623%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%230a0c0a%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22purple%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%22.3%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%2317101d%22%2F%3E%3Cstop%20offset%3D%22.28%22%20stop-color%3D%22%23684672%22%2F%3E%3Cstop%20offset%3D%22.55%22%20stop-color%3D%22%2370497c%22%2F%3E%3Cstop%20offset%3D%22.8%22%20stop-color%3D%22%2351335e%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23271b2d%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22crease%22%3E%3Cstop%20stop-color%3D%22%23000%22%20stop-opacity%3D%22.8%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23000%22%20stop-opacity%3D%220%22%2F%3E%3C%2FlinearGradient%3E%3Cpattern%20id%3D%22weave%22%20width%3D%223%22%20height%3D%223%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M0%200L3%203M-1%202L1%204%22%20stroke%3D%22%23c7c4b6%22%20stroke-opacity%3D%22.055%22%20stroke-width%3D%22.5%22%2F%3E%3Cpath%20d%3D%22M0%203L3%200%22%20stroke%3D%22%23000%22%20stroke-opacity%3D%22.16%22%20stroke-width%3D%22.5%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M17%205H223L210%2078Q166%2096%20120%2098Q74%2096%2030%2078Z%22%20fill%3D%22url%28%23face%29%22%20stroke%3D%22%23111310%22%20stroke-width%3D%221%22%2F%3E%3Cpath%20d%3D%22M17%205H223L210%2078Q166%2096%20120%2098Q74%2096%2030%2078Z%22%20fill%3D%22url%28%23weave%29%22%2F%3E%3Cpath%20d%3D%22M18%207C22%2036%2038%2056%2046%2076L35%2080C33%2056%2020%2033%2018%207Z%22%20fill%3D%22url%28%23crease%29%22%2F%3E%3Cpath%20d%3D%22M222%207C218%2036%20202%2056%20194%2076L205%2080C207%2056%20220%2033%20222%207Z%22%20fill%3D%22url%28%23crease%29%22%2F%3E%3Cpath%20d%3D%22M30%2077Q74%2092%20120%2094Q166%2092%20210%2077%22%20fill%3D%22none%22%20stroke%3D%22%23806578%22%20stroke-opacity%3D%22.65%22%20stroke-width%3D%22.65%22%20stroke-dasharray%3D%223%202%22%2F%3E%3Cpath%20d%3D%22M17%205C17%2029%2029%2048%2039%2070C29%2063%2015%2065%206%2074C10%2057%2014%2031%2017%205Z%22%20fill%3D%22url%28%23side%29%22%20stroke%3D%22%23141612%22%20stroke-width%3D%22.6%22%2F%3E%3Cpath%20d%3D%22M223%205C223%2029%20211%2048%20201%2070C211%2063%20225%2065%20234%2074C230%2057%20226%2031%20223%205Z%22%20fill%3D%22url%28%23side%29%22%20stroke%3D%22%23141612%22%20stroke-width%3D%22.6%22%2F%3E%3Cpath%20d%3D%22M17%205C17%2029%2029%2048%2039%2070C29%2063%2015%2065%206%2074C10%2057%2014%2031%2017%205ZM223%205C223%2029%20211%2048%20201%2070C211%2063%20225%2065%20234%2074C230%2057%20226%2031%20223%205Z%22%20fill%3D%22url%28%23weave%29%22%2F%3E%3Cpath%20d%3D%22M6%2074C15%2066%2029%2064%2039%2070C43%2076%2031%2082%2018%2085L17%2078C12%2078%208%2076%206%2074Z%22%20fill%3D%22url%28%23purple%29%22%20stroke%3D%22%23151015%22%20stroke-width%3D%22.7%22%2F%3E%3Cpath%20d%3D%22M234%2074C225%2066%20211%2064%20201%2070C197%2076%20209%2082%20222%2085L223%2078C228%2078%20232%2076%20234%2074Z%22%20fill%3D%22url%28%23purple%29%22%20stroke%3D%22%23151015%22%20stroke-width%3D%22.7%22%2F%3E%3Cpath%20d%3D%22M6%2074C15%2066%2029%2064%2039%2070M234%2074C225%2066%20211%2064%20201%2070%22%20fill%3D%22none%22%20stroke%3D%22%230b0d0a%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M7%2070C17%2062%2028%2061%2037%2066M233%2070C223%2062%20212%2061%20203%2066%22%20fill%3D%22none%22%20stroke%3D%22%23806578%22%20stroke-width%3D%22.65%22%20stroke-dasharray%3D%223%202%22%20stroke-opacity%3D%22.65%22%2F%3E%3Cpath%20d%3D%22M18%207Q120%208%20222%207%22%20fill%3D%22none%22%20stroke%3D%22%23777669%22%20stroke-opacity%3D%22.25%22%20stroke-width%3D%221%22%2F%3E%3Cpath%20d%3D%22M17%2078C23%2080%2034%2076%2039%2071M223%2078C217%2080%20206%2076%20201%2071%22%20fill%3D%22none%22%20stroke%3D%22%23201524%22%20stroke-width%3D%221.3%22%2F%3E%3Cpath%20d%3D%22M18%2079L19%2083M222%2079L221%2083%22%20fill%3D%22none%22%20stroke%3D%22%239976a1%22%20stroke-opacity%3D%22.3%22%20stroke-width%3D%22.7%22%2F%3E%3C%2Fsvg%3E") center / 100% 100% no-repeat;
                        pointer-events: none;
                        z-index: -1;
                    }
                    .bbgl-title-card-value {
                        position: relative;
                        z-index: 1;
                        display: flex;
                        align-items: baseline;
                        justify-content: center;
                        flex-wrap: wrap;
                        gap: calc(var(--bbgl-t-gap) * .8);
                        width: 100%;
                        min-width: 0;
                        max-width: 100%;
                        box-sizing: border-box;
                        text-align: center;
                    }

                    .bbgl-title-card-value .bbgl-titles-title {
                        display: block;
                        max-width: 100%;
                        font-size: min(14cqw, 25cqh);
                        line-height: 1.05;
                        overflow-wrap: normal;
                        word-break: keep-all;
                        white-space: normal;
                    }

                    .bbgl-title-card-value .bbgl-titles-title:has(.bbgl-title-word.is-long) {
                        font-size: min(11cqw, 22cqh);
                    }

                    .bbgl-title-card-value .bbgl-titles-title:has(.bbgl-title-word.is-very-long) {
                        font-size: min(9.5cqw, 20cqh);
                    }

                    .bbgl-title-card-sign-face .bbgl-title-word {
                        color: #fff0c7;
                        background: none;
                        -webkit-text-fill-color: currentColor;
                        text-shadow: 0 1px 1px rgba(38, 8, 52, .9);
                        filter: none;
                        animation: none;
                    }

                    .bbgl-title-card-sign-face .bbgl-title-reset,
                    .bbgl-title-card-sign-face .bbgl-title-card-empty {
                        color: #f6dc98;
                        text-shadow: 0 1px 1px rgba(38, 8, 52, .82);
                    }

                    .bbgl-title-card-empty {
                        font-family: 'Fjalla One', 'Barlow Condensed', 'Arial Narrow', sans-serif;
                        font-size: var(--bbgl-t-fs-line);
                        line-height: 1.2;
                        letter-spacing: .06em;
                        text-transform: uppercase;
                        color: rgba(170, 176, 177, .38);
                        text-shadow: 0 1px 1px rgba(0, 0, 0, .8);
                    }

                    /* Reset-to-automatic arrow. Only rendered while a hand-picked title is active,
                       so its mere presence says you're off the automatic pair. */
                    .bbgl-title-reset {
                        flex: 0 0 auto;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: var(--bbgl-t-reset);
                        height: var(--bbgl-t-reset);
                        padding: 0;
                        margin: 0;
                        color: rgba(255, 255, 255, .45);
                        background: none;
                        border: none;
                        border-radius: 50%;
                        cursor: pointer;
                        transition: color .15s, transform .25s;
                    }

                    .bbgl-title-reset svg {
                        width: 100%;
                        height: 100%;
                        display: block;
                    }

                    /* Hangs off the right edge of the card's The label. Absolutely positioned, so it
                       never shifts that label or the title under it; the label itself is
                       pointer-events none, so the button opts back in. */
                    .bbgl-title-card-title-label .bbgl-title-reset {
                        position: absolute;
                        left: 100%;
                        top: 50%;
                        margin-left: .2em;
                        translate: 0 calc(-50% + .5px);
                        pointer-events: auto;
                    }

                    body:not(.is-touch-device) .bbgl-title-reset:hover {
                        color: #d8b4fe;
                        transform: rotate(-180deg);
                    }

                    #bbgl-panel.bbgl-no-animations .bbgl-title-reset {
                        transition: none;
                    }

                    #bbgl-panel.bbgl-no-animations .bbgl-title-reset:hover {
                        transform: none;
                    }

                    /* ─── Engraved machine scale ─────────────────────────────────────────
                       No shared plaque, face or border: this transparent box reserves the single
                       milestone row above the track. The narrow channel below reads as a groove cut
                       straight into the panel surface, so the ambient photo texture and scanlines
                       stay uninterrupted around it. All seven plaques (six bands plus the Fully
                       Bricked capstone) live on one axis inside .bbgl-rank-scale, as a plain
                       single-child wrapper. */
                    .bbgl-rank-track {
                        position: relative;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        flex: 0 0 auto;
                        width: 100%;
                        box-sizing: border-box;
                        padding: 0;
                        pointer-events: none;
                    }

                    .bbgl-rank-scale {
                        position: relative;
                        flex: 1 1 auto;
                        min-width: 0;
                        height: var(--bbgl-t-rank-h);
                        min-height: var(--bbgl-t-rank-h);
                        box-sizing: border-box;
                    }

                    /* Shallow divot pressed into the panel, not a slot cut through it — a dished
                       recession with rounded caps, a base tone lifted toward the panel's own value,
                       and soft elliptical inner shading reads as material pushed in, not a hole.

                       Its LENGTH is derived rather than set. The anchored thing is --bbgl-t-rank-edge,
                       a fixed gap held at the far left and far right of the whole rank area; what is
                       left over is the title track, that track divides into N equal slots, and the
                       groove then runs from the first slot's centre to the last one's — because those
                       centres are the 0% and 100% milestones by definition (see .bbgl-rank-titles).

                       So the groove is always (N-1)/N of the track, whatever the width. That is the
                       point: end titles are centred on the groove's ends and hang half their width
                       past them, and the room they hang into is now half a slot, which SCALES. The
                       old fixed inset had to be hand-tuned per mode against label widths that move,
                       and was the thing that clipped when it guessed low.

                       Working back from the anchored edge: the groove's inset is the edge gap plus
                       half a slot, which in scale-relative terms is
                           edge * (N-1)/N  +  100% / 2N
                       — the two terms below. N=6 gives edge*5/6 + 8.333%. */
                    .bbgl-rank-line {
                        /* Titles on the axis: LEVEL_TITLE_BANDS plus the capstone
                           (03-section-ii-utils.js). Declared here rather than on .bbgl-rank-titles
                           because BOTH need it now — that child sizes its slots from it, and the
                           groove's own inset above is derived from it. */
                        --bbgl-t-title-count: 6;
                        /* Knob geometry lives here rather than on .bbgl-rank-knob itself, so any
                           sibling that needs to reserve clearance around it can read the same
                           numbers. */
                        --bbgl-t-knob-fs: calc(var(--bbgl-t-display-fs) * .82);
                        --bbgl-t-tick-h: var(--bbgl-t-tick-h-override, calc(var(--bbgl-t-fs-notch, 10px) * .56));
                        --bbgl-t-slider-tick-h: var(--bbgl-t-slider-tick-h-override, calc(var(--bbgl-t-fs-notch, 10px) * .28));
                        /* Visual-only growth: the pseudo-element and numeral move without changing
                           .bbgl-rank-knob's measured height, so the layout solver leaves the line
                           and title milestones exactly where they are. */
                        --bbgl-t-slider-tick-grow: var(--bbgl-t-slider-tick-grow-override, 1px);
                        position: absolute;
                        isolation: isolate;
                        /* Lengthens the groove past the derived inset above by this factor, taken
                           evenly off both ends (inset' = inset * f - 100% * (f - 1) / 2, which keeps
                           the groove centred). Everything horizontal rides the groove's own width —
                           title slots, ruler ticks, the knob — so they spread with it. 1 restores the
                           edge-anchored length exactly. */
                        --bbgl-t-rank-stretch: 1.06;
                        left: calc((var(--bbgl-t-rank-edge) * (var(--bbgl-t-title-count) - 1) / var(--bbgl-t-title-count)
                                 + 100% / (2 * var(--bbgl-t-title-count))) * var(--bbgl-t-rank-stretch)
                                 - 100% * (var(--bbgl-t-rank-stretch) - 1) / 2);
                        right: calc((var(--bbgl-t-rank-edge) * (var(--bbgl-t-title-count) - 1) / var(--bbgl-t-title-count)
                                  + 100% / (2 * var(--bbgl-t-title-count))) * var(--bbgl-t-rank-stretch)
                                  - 100% * (var(--bbgl-t-rank-stretch) - 1) / 2);
                        /* The rank scale is the bottom region left after .bbgl-titles-main takes the
                           stat cards' share. Keep the complete groove/plaque/readout assembly centred
                           in that remaining region instead of assigning a separate per-mode offset. */
                        top: var(--bbgl-t-rank-line-y, 50%);
                        bottom: auto;
                        /* Groove thickness, split from --bbgl-t-bar-h (which stays the tick width)
                           so a mode can thin the horizontal line without touching the verticals. */
                        height: var(--bbgl-t-groove-h, var(--bbgl-t-hair, var(--bbgl-t-bar-h)));
                        min-height: 0;
                        transform: translateY(-50%);
                        border: 0;
                        border-radius: 999px;
                        background:
                            radial-gradient(ellipse 100% 260% at 50% 118%, rgba(150, 158, 158, .10), transparent 70%),
                            linear-gradient(180deg, #0a0d0e, #171b1c 62%, #272c2d);
                        box-shadow:
                            inset 0 1px 1.5px rgba(0, 0, 0, .85),
                            inset 0 -1px 0 rgba(160, 168, 168, .10),
                            0 1px 0 rgba(150, 158, 158, .05);
                    }

                    /* Milestone tethers now carry the axis markings, so the groove itself needs no
                       extra shoulders, endpoint glyphs or implied range boundaries. */
                    .bbgl-rank-line::before {
                        content: none;
                    }

                    .bbgl-rank-line::after {
                        content: none;
                    }

                    /* ─── Rank milestones ──────────────────────────────────────────────────
                       Six titles sit on their actual unlock coordinates. Their fine vertical
                       tethers behave like ruler marks: they anchor the words without implying that
                       a title unlocks at the edge of a surrounding box. */
                    /* Positioned against .bbgl-rank-LINE, not the scale — this container is a child of
                       the groove (achBuildPageTitles(), 06-section-v-logic.js). So its own box is
                       the 1px groove itself, and every vertical
                       value on the labels below resolves against THAT. A percentage or a height here
                       can only ever describe 1px of groove; only an explicit (negative) offset can
                       reach up into the gap above it.

                       Horizontally it is WIDER than the groove, on purpose. The six titles are laid
                       out as six equal grid cells so each owns a real box rather than hanging off a
                       single coordinate, and their milestones are the groove's 0%, 20%, 40%, 60%,
                       80% and 100% — five even gaps. For a cell's CENTRE to land on its milestone,
                       the track has to start half a cell before 0% and end half a cell after 100%,
                       which is exactly the room the two end titles were already overhanging into.
                       Hence the negative left/right of half a milestone gap each: total width 120%
                       of the groove, six cells of 20% each, centres at 0/20/40/60/80/100.

                       Left and right are both set with width:auto, so the width falls out of the two
                       offsets rather than being stated a third time and able to disagree with them. */
                    .bbgl-rank-titles {
                        /* --bbgl-t-title-count is inherited from .bbgl-rank-line, which derives its
                           own length from it too — one declaration feeding both ends of the
                           relationship instead of two that can drift apart.

                           Distance between neighbouring milestones as a share of the groove: N
                           titles span N-1 gaps. Half of it is the overhang at each end. */
                        --bbgl-t-title-gap: calc(100% / (var(--bbgl-t-title-count) - 1));
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: calc(var(--bbgl-t-title-gap) / -2);
                        right: calc(var(--bbgl-t-title-gap) / -2);
                        /* auto-flow rather than repeat(N, 1fr): the track takes exactly as many equal
                           columns as there are slots, so the column count can never fall out of step
                           with how many titles were actually rendered. */
                        display: grid;
                        grid-auto-flow: column;
                        grid-auto-columns: 1fr;
                        pointer-events: none;
                    }

                    /* One title's designated space. Stretches to the container's full (1px groove)
                       height as a grid item, so a title's own top/bottom still resolve against the
                       same box they did when they were positioned directly on the groove — the slot
                       changes what a title's left:50% means, and nothing else.

                       min-width:0 so a long title cannot push its cell wider than its 1fr share and
                       drag the whole track off the milestones; overflow stays visible because titles
                       are still meant to spill past their slot edges at the moment. */
                    .bbgl-rank-title-slot {
                        position: relative;
                        min-width: 0;
                    }

                    /* --bbgl-t-titles-y is written by layoutRankBarCenter() (07-section-vi-ui.js) and
                       is the midpoint of the gap between the stat/identity cards' real measured bottom
                       edge and the groove — as an offset from the GROOVE'S OWN top edge, which is what
                       this element is positioned against. It is therefore negative: the whole gap sits
                       above the line. Nothing in the rank chain clips, so that paints fine.
                       The -20px fallback is only what shows for the frame before that pass runs; it is
                       negative for the same reason, since any positive value (or any percentage of the
                       1px groove) would flash the labels sitting ON the line. */
                    .bbgl-rank-title {
                        position: absolute;
                        /* Centre of its own slot, which the grid has already placed on the milestone
                           — the inline left:N% this used to carry is gone (achTitleLabelsHTML(),
                           06-section-v-logic.js). Same rendered position, one source for it. */
                        left: 50%;
                        top: var(--bbgl-t-titles-y, -20px);
                        transform: translate(-50%, -50%);
                        pointer-events: auto;
                        cursor: help;
                        white-space: nowrap;
                        text-align: center;
                        font-family: 'Fjalla One', 'Barlow Condensed', 'Arial Narrow', sans-serif;
                        font-size: var(--bbgl-t-fs-notch, 10px);
                        font-weight: 500;
                        letter-spacing: .08em;
                        line-height: 1;
                    }

                    .bbgl-rank-title.is-milestone {
                        /* Flush with the groove's lower edge. The former negative half-height let
                           the vertical tick continue visibly beneath the horizontal line. */
                        bottom: 0;
                        width: 0;
                        transform: translateX(-50%);
                    }

                    .bbgl-rank-title.is-milestone::after {
                        content: '';
                        position: absolute;
                        left: calc(var(--bbgl-t-bar-h) / -2);
                        top: auto;
                        bottom: 0;
                        width: var(--bbgl-t-bar-h);
                        height: var(--bbgl-t-tick-h);
                        border-radius: 999px;
                        /* The rank groove's cross-section turned through 90 degrees: same dark
                           centre, recessed edge and restrained steel lip, just on a short tick. */
                        background:
                            radial-gradient(ellipse 260% 100% at 118% 50%, rgba(150, 158, 158, .10), transparent 70%),
                            linear-gradient(90deg, #0a0d0e, #171b1c 62%, #272c2d);
                        box-shadow:
                            inset 1px 0 1.5px rgba(0, 0, 0, .85),
                            inset -1px 0 0 rgba(160, 168, 168, .10),
                            1px 0 0 rgba(150, 158, 158, .05);
                    }

                    .bbgl-rank-title-text {
                        position: absolute;
                        top: 0;
                        left: 50%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        transform: translate(-50%, -50%);
                    }

                    .bbgl-rank-title.is-capstone .bbgl-rank-title-text {
                        left: 0;
                    }

                    .bbgl-rank-title.is-milestone .bbgl-rank-title-text {
                        top: auto;
                        bottom: calc(var(--bbgl-t-tick-h) + .2em + var(--bbgl-rank-visual-drop, 0px));
                        transform: translateX(-50%);
                    }

                    .bbgl-rank-title.is-capstone.is-locked {
                        display: block;
                        color: rgba(150, 158, 158, .42);
                    }

                    .bbgl-rank-title.is-revealed {
                        color: #c4c6c3;
                        text-shadow: 0 1px 1px rgba(0, 0, 0, .8);
                    }

                    /* ─── Rank-name material ladder ─────────────────────────────────────
                       The visible rank scale and identity-card plaque share this progression. Each
                       atrophy cycle changes the WORDS but keeps the same five materials; Fully
                       Bricked is the one true terminal sixth tier. Apply paint to each wrapped line
                       rather than the title container so two-line names receive one clean gradient
                       per line.

                       T1 stays plain. T2 is the first presentation upgrade: flat lettering flickers
                       on like a fluorescent sign, then holds a restrained steady light. T3 is the
                       first physical-looking title and begins the material progression. Gold and the
                       Diamond-family A2 capstone retain color-driven motion inside the glyphs. */
                    :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).is-revealed .bbgl-rank-notch-line {
                        color: #fff;
                        background: none;
                        -webkit-text-fill-color: currentColor;
                        -webkit-text-stroke: 0;
                        text-shadow: 0 1px 1px rgba(0, 0, 0, .65);
                        filter: none;
                    }

                    :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque):is(.material-bright-silver, .material-gold, .material-diamond).is-revealed .bbgl-rank-notch-line {
                        background-clip: text;
                        -webkit-background-clip: text;
                        color: transparent;
                        -webkit-text-fill-color: transparent;
                    }

                    /* T1 — deliberately plain baseline. */
                    :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-iron.is-revealed .bbgl-rank-notch-line {
                        color: #000;
                        background: none;
                        -webkit-text-fill-color: currentColor;
                        font-family: 'Patrick Hand', 'Segoe Print', 'Comic Sans MS', cursive;
                        font-weight: 400;
                        text-shadow: none;
                        filter: none;
                        animation: none;
                    }

                    .bbgl-rank-title.material-iron.is-revealed .bbgl-rank-notch-line {
                        color: #eee9dc;
                    }

                    /* T2 — illuminated typography, still flat rather than materially constructed.
                       The uneven one-shot ignition briefly falls back to its gray unlit face before
                       settling into a modest off-white lamp glow. It never flickers again once lit,
                       keeping T3's brighter aluminum face and reflected streak as a clear promotion. */
                    :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-steel.is-revealed .bbgl-rank-notch-line {
                        font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
                        color: #d9dddf;
                        background: none;
                        -webkit-text-fill-color: currentColor;
                        font-weight: 500;
                        text-shadow:
                            var(--rank-steel-outline, 0 0 0 transparent),
                            0 1px 1px rgba(0, 0, 0, .68),
                            0 0 3px rgba(232, 239, 242, .82),
                            0 0 8px rgba(216, 229, 234, .48),
                            0 0 14px rgba(201, 219, 225, .20);
                        filter: none;
                        animation: bbgl-rank-name-fluorescent-on 2.5s step-end 1 both;
                        animation-delay: var(--bbgl-rank-lightbox-delay, 0ms);
                    }

                    :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-silver.is-revealed .bbgl-rank-title-text {
                        background-image: linear-gradient(141deg,
                            #d9ad75 0%, #87522e 16%, #bc8b54 30%, #634025 42%,
                            #a16a3b 49%, #d9ad75 55%, #bb8d58 62%, #80502d 77%,
                            #ad7b45 90%, #593820 100%);
                        background-size: 100% 100%;
                        background-repeat: no-repeat;
                        background-clip: text;
                        -webkit-background-clip: text;
                        color: transparent;
                        -webkit-text-fill-color: transparent;
                        font-family: 'Aldrich', 'Arial Black', sans-serif;
                        font-weight: 400;
                        letter-spacing: .015em;
                        -webkit-text-stroke: .1px rgba(217, 173, 117, .3);
                        text-shadow: 0 1px 0 #624029, 0 1.5px 0 #4c311f;
                        filter: none;
                        animation: none;
                    }

                    :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-silver.is-revealed .bbgl-rank-notch-line {
                        width: 100%;
                        text-align: center;
                        color: transparent;
                        background: none;
                        -webkit-text-fill-color: transparent;
                        -webkit-text-stroke: inherit;
                        text-shadow: inherit;
                        filter: none;
                        animation: none;
                    }
                    .bbgl-rank-title.material-silver.is-revealed .bbgl-rank-title-text {
                        filter:
                            drop-shadow(1px 0 0 #090b0b)
                            drop-shadow(-1px 0 0 #090b0b)
                            drop-shadow(0 1px 0 #090b0b)
                            drop-shadow(0 -1px 0 #090b0b)
                            drop-shadow(0 2px 2px rgba(0, 0, 0, .8));
                    }

                    /* Rank scale labels only: T2 gets the same black letter outline as T3 above.
                       Its fluorescent glow lives in text-shadow, and a filter outline would trace
                       that haze instead of the letters, so the outline rides as the top text-shadow
                       layer through --rank-steel-outline. The steel rule and its ignition keyframes
                       read it with a transparent fallback, so the card plaque (which shares both)
                       is unchanged. */
                    .bbgl-rank-title.material-steel.is-revealed .bbgl-rank-notch-line {
                        --rank-steel-outline:
                            1px 0 0 #090b0b,
                            -1px 0 0 #090b0b,
                            0 1px 0 #090b0b,
                            0 -1px 0 #090b0b;
                    }

                    /* T4 gets a silver outline. Its emerald face is background-clipped text with a
                       transparent fill, so a text-shadow would show through the letters - it needs
                       the same filter approach as T3. */
                    .bbgl-rank-title.material-bright-silver.is-revealed .bbgl-rank-title-text {
                        filter:
                            drop-shadow(.25px 0 0 #c9d3d880)
                            drop-shadow(-.25px 0 0 #c9d3d880)
                            drop-shadow(0 .25px 0 #c9d3d880)
                            drop-shadow(0 -.25px 0 #c9d3d880)
                            drop-shadow(0 2px 2px rgba(0, 0, 0, .8));
                    }

                    /* T5 gets an outline in its crown plaque deep gold (achGoldCrownHTML), dark
                       enough to separate from the bright gold letters. On the wrapper, not the
                       line, so it stacks with the line glow filter instead of replacing it. */
                    .bbgl-rank-title.material-gold.is-revealed .bbgl-rank-title-text {
                        filter:
                            drop-shadow(.5px 0 0 #9d6318b3)
                            drop-shadow(-.5px 0 0 #9d6318b3)
                            drop-shadow(0 .5px 0 #9d6318b3)
                            drop-shadow(0 -.5px 0 #9d6318b3)
                            drop-shadow(0 2px 2px rgba(0, 0, 0, .8));
                    }

                    /* T4 — cut emerald. Hard stops in the stationary ramp carve facets instead of
                       metal's soft tonal roll. The moving layer is a centred ring of refraction:
                       both sides start together in the middle, then separate toward the ends as it
                       expands. The opening's minimum width (2.5em) keeps short second-row words
                       interpolating cleanly. */
                    :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-bright-silver.is-revealed .bbgl-rank-notch-line {
                        --rank-emerald-start: max(50%, 2.5em);
                        --rank-emerald-light: radial-gradient(ellipse at center,
                            transparent 0%, transparent 30%,
                            rgba(48, 255, 137, .18) 33%,
                            rgba(111, 255, 167, .48) 36%,
                            rgba(225, 255, 236, .84) 38.5%,
                            rgba(255, 255, 255, 1) 40%,
                            rgba(255, 255, 255, 1) 42%,
                            rgba(177, 255, 205, .72) 43.5%,
                            rgba(46, 255, 136, .42) 45%,
                            rgba(235, 255, 242, .80) 46%,
                            rgba(23, 238, 116, .22) 48.5%,
                            transparent 52%, transparent 100%);
                        --rank-emerald-glow: radial-gradient(ellipse at center,
                            transparent 0%, transparent 27%,
                            rgba(0, 245, 101, .12) 30%,
                            rgba(8, 250, 112, .58) 35%,
                            rgba(111, 255, 166, .76) 38%,
                            rgba(235, 255, 243, .94) 40%,
                            rgba(255, 255, 255, 1) 42%,
                            rgba(157, 255, 190, .78) 44%,
                            rgba(5, 246, 106, .62) 48%,
                            rgba(0, 225, 88, .12) 52%,
                            transparent 57%, transparent 100%);
                        background-image:
                            var(--rank-emerald-light),
                            linear-gradient(135deg, #93dcbc 0%, #1a9d70 22%, #006044 46%, #52b58e 52%, #087451 68%, #002f23 100%);
                        background-size: var(--rank-emerald-start) 240%, 100% 100%;
                        background-position: 50% 50%, 0 0;
                        background-repeat: no-repeat, no-repeat;
                        font-weight: 400;
                        -webkit-text-stroke: .2px rgba(147, 220, 188, .42);
                        text-shadow: 0 1px 1px rgba(0, 44, 28, .52);
                        filter: none;
                        animation: bbgl-rank-name-emerald 4.6s cubic-bezier(.3, 0, .55, 1) infinite;
                        animation-delay: var(--bbgl-titles-animation-delay, 0ms);
                    }

                    /* A blurred green transmission of the travelling light sits behind the face.
                       There is deliberately no permanent emerald drop-shadow: the backdrop remains
                       dark until the moving refraction reaches a cut, then blooms saturated green
                       as though the light has passed through the stone rather than reflecting off
                       its front surface. */
                    :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-bright-silver.is-revealed .bbgl-rank-notch-line::before {
                        content: attr(data-rank-text);
                        position: absolute;
                        inset: 0;
                        z-index: -1;
                        color: transparent;
                        -webkit-text-fill-color: transparent;
                        -webkit-text-stroke: 0;
                        text-shadow: none;
                        background-image: var(--rank-emerald-glow);
                        background-size: var(--rank-emerald-start) 240%;
                        background-position: 50% 50%;
                        background-repeat: no-repeat;
                        background-clip: text;
                        -webkit-background-clip: text;
                        filter:
                            blur(3.5px)
                            drop-shadow(0 0 3px rgba(41, 255, 137, .76))
                            drop-shadow(0 0 7px rgba(0, 226, 92, .64));
                        opacity: .35;
                        pointer-events: none;
                        animation: bbgl-rank-name-emerald-glow 4.6s cubic-bezier(.3, 0, .55, 1) infinite;
                        animation-delay: var(--bbgl-titles-animation-delay, 0ms);
                    }

                    /* T5 — polished gold. The dimensional metal is stationary; a separate
                       transparent polish band crosses it left-to-right. Because that band is fully
                       off-glyph at both endpoints, the base lighting before and after the pass is
                       identical and the one-way animation can reset invisibly. */
                    :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-gold.is-revealed .bbgl-rank-notch-line {
                        --rank-gold-sheen: linear-gradient(105deg,
                            transparent 0%, transparent 40%,
                            rgba(255, 234, 145, .24) 43%, rgba(255, 249, 214, .72) 47%,
                            #ffffff 49.25%, #ffffff 50%, rgba(255, 246, 196, .68) 53%,
                            rgba(255, 220, 102, .20) 57%, transparent 60%, transparent 100%);
                        background-image:
                            var(--rank-gold-sheen),
                            linear-gradient(105deg,
                                #eab640 0%, #ffd765 18%, #fff3aa 33%, #ffe486 43%,
                                #fff2ad 49%, #ffdd72 57%, #fbd057 72%, #fff0aa 88%, #e8b13d 100%);
                        background-size: 300% 100%, 100% 100%;
                        background-position: 100% 50%, 0 0;
                        text-shadow: 0 1px 1px rgba(65, 39, 0, .58);
                        filter:
                            drop-shadow(0 0 2px rgba(255, 211, 82, .54))
                            drop-shadow(0 0 4.25px rgba(232, 161, 25, .30));
                        animation: bbgl-rank-name-gold-shine 3.2s cubic-bezier(.3, 0, .55, 1) infinite;
                        animation-delay: var(--bbgl-titles-animation-delay, 0ms);
                    }

                    /* The background copy contains only the moving polish band. The faint gold
                       base glow comes from the stationary drop-shadows above, so this layer is
                       transparent at both endpoints too and cannot expose the loop boundary. */
                    :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-gold.is-revealed .bbgl-rank-notch-line::before {
                        content: attr(data-rank-text);
                        position: absolute;
                        inset: 0;
                        z-index: -1;
                        transform: translateY(1px);
                        color: transparent;
                        -webkit-text-fill-color: transparent;
                        background-image: var(--rank-gold-sheen);
                        background-size: 300% 100%;
                        background-position: 100% 50%;
                        background-clip: text;
                        -webkit-background-clip: text;
                        filter: blur(5.5px);
                        opacity: .78;
                        pointer-events: none;
                        animation: bbgl-rank-name-gold-glow 3.2s cubic-bezier(.3, 0, .55, 1) infinite;
                        animation-delay: var(--bbgl-titles-animation-delay, 0ms);
                    }

                    /* T6 — Fully Bricked. The bright high-contrast platinum ramp is the permanent
                       body of every glyph; the iridescent layer above it is translucent light, not
                       paint. Only that colored reflection travels, so the title remains glassy,
                       platinum and dimensional at every point in the animation rather than turning
                       into alternating blocks of opaque rainbow color. */
                    :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-diamond.is-revealed .bbgl-rank-notch-line {
                        background-image:
                            linear-gradient(105deg,
                                transparent 0%, transparent 24%,
                                rgba(255, 159, 220, .16) 29%,
                                rgba(255, 159, 220, .58) 34%,
                                rgba(255, 233, 143, .48) 42%,
                                rgba(124, 245, 207, .50) 50%,
                                rgba(255, 255, 255, .88) 52%,
                                rgba(70, 180, 255, .56) 57%,
                                rgba(177, 101, 241, .58) 65%,
                                rgba(177, 101, 241, .14) 70%,
                                transparent 76%, transparent 100%),
                            linear-gradient(105deg,
                                #d6e3e9 0%, #f3f8fa 18%, #ffffff 33%, #e8f0f3 43%,
                                #ffffff 49%, #dde8ed 57%, #ffffff 72%, #edf4f7 88%, #cedce3 100%);
                        background-size: 300% 100%, 100% 100%;
                        background-position: 100% 50%, 0 0;
                        text-shadow: 0 1px 1px rgba(57, 65, 78, .42);
                        filter: drop-shadow(0 0 3.5px rgba(239, 251, 255, .62));
                        animation: bbgl-rank-name-diamond 4.2s ease-in-out infinite alternate;
                        animation-delay: var(--bbgl-titles-animation-delay, 0ms);
                    }

                    /* Depth belongs behind the completed two-line title, not over the translucent
                       glyph fill. Applying it to the shared wrapper keeps the pearl face bright
                       while giving the whole mark a darker, more prominent lift from the panel. */
                    :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-diamond.is-revealed .bbgl-rank-title-text {
                        filter:
                            drop-shadow(0 2px 1px rgba(12, 16, 25, .76))
                            drop-shadow(0 3px 2.5px rgba(6, 9, 16, .52));
                    }

                    /* A blurred duplicate of each line paints one continuous iridescent ribbon
                       behind the platinum face. Unlike stacked colored drop-shadows, the hues keep
                       their own positions instead of mixing into a single gray-white bloom. */
                    :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-diamond.is-revealed .bbgl-rank-notch-line::before {
                        content: attr(data-rank-text);
                        position: absolute;
                        inset: 0;
                        z-index: -1;
                        color: transparent;
                        -webkit-text-fill-color: transparent;
                        background-image: linear-gradient(105deg,
                            #ff52bd 0%, #ffcb43 24%, #86ef82 43%,
                            #36caff 63%, #a34dff 82%, #ff52bd 100%);
                        background-size: 300% 100%;
                        background-position: 100% 50%;
                        background-clip: text;
                        -webkit-background-clip: text;
                        filter: blur(6.5px);
                        opacity: .80;
                        pointer-events: none;
                        animation: bbgl-rank-name-diamond-glow 4.2s ease-in-out infinite alternate;
                        animation-delay: var(--bbgl-titles-animation-delay, 0ms);
                    }

                    /* Stationary pearl-platinum light beneath the colored ribbon restores the
                       strong luminous base without mixing the iridescent hues together. It uses
                       the same blur radius, so intensity rises without growing the bloom. */
                    :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-diamond.is-revealed .bbgl-rank-notch-line::after {
                        content: attr(data-rank-text);
                        position: absolute;
                        inset: 0;
                        z-index: -2;
                        color: transparent;
                        -webkit-text-fill-color: transparent;
                        background-image: linear-gradient(105deg,
                            #dcecf3 0%, #ffffff 22%, #e6f1f5 43%,
                            #ffffff 55%, #d9e8f0 76%, #ffffff 100%);
                        background-clip: text;
                        -webkit-background-clip: text;
                        filter: blur(6.5px);
                        opacity: .68;
                        pointer-events: none;
                    }

                    @keyframes bbgl-rank-name-fluorescent-on {
                        0%, 30%, 33%, 40%, 45%, 64%, 74% {
                            color: #858a8d;
                            font-weight: 400;
                            text-shadow:
                                var(--rank-steel-outline, 0 0 0 transparent),
                                0 1px 1px rgba(0, 0, 0, .68);
                        }
                        30.01%, 38%, 44% {
                            color: #a3adaf;
                            font-weight: 500;
                            text-shadow:
                                var(--rank-steel-outline, 0 0 0 transparent),
                                0 1px 1px rgba(0, 0, 0, .68),
                                0 0 2px rgba(224, 232, 235, .25),
                                0 0 5px rgba(207, 221, 226, .10);
                        }
                        53%, 72% {
                            color: #c9ced0;
                            font-weight: 500;
                            text-shadow:
                                var(--rank-steel-outline, 0 0 0 transparent),
                                0 1px 1px rgba(0, 0, 0, .68),
                                0 0 3px rgba(224, 232, 235, .50),
                                0 0 7px rgba(207, 221, 226, .24);
                        }
                        76%, 100% {
                            color: #d9dddf;
                            font-weight: 500;
                            text-shadow:
                                var(--rank-steel-outline, 0 0 0 transparent),
                                0 1px 1px rgba(0, 0, 0, .68),
                                0 0 3px rgba(232, 239, 242, .82),
                                0 0 8px rgba(216, 229, 234, .48),
                                0 0 14px rgba(201, 219, 225, .20);
                        }
                    }

                    @keyframes bbgl-rank-name-emerald {
                        from { background-size: var(--rank-emerald-start) 240%, 100% 100%; }
                        to { background-size: 400% 240%, 100% 100%; }
                    }

                    @keyframes bbgl-rank-name-emerald-glow {
                        from { background-size: var(--rank-emerald-start) 240%; }
                        to { background-size: 400% 240%; }
                    }

                    @keyframes bbgl-rank-name-gold-shine {
                        from { background-position: 100% 50%, 0 0; }
                        to { background-position: 0% 50%, 0 0; }
                    }

                    @keyframes bbgl-rank-name-gold-glow {
                        from { background-position: 100% 50%; }
                        to { background-position: 0% 50%; }
                    }

                    @keyframes bbgl-rank-name-diamond {
                        from { background-position: 100% 50%, 0 0; }
                        to { background-position: 0% 50%, 0 0; }
                    }

                    @keyframes bbgl-rank-name-diamond-glow {
                        from { background-position: 100% 50%; }
                        to { background-position: 0% 50%; }
                    }

                    #bbgl-panel.bbgl-no-animations :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).is-revealed .bbgl-rank-notch-line {
                        animation: none;
                        background-position: 50% 50%;
                    }

                    #bbgl-panel.bbgl-no-animations :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-bright-silver.is-revealed .bbgl-rank-notch-line {
                        background-size: 400% 240%, 100% 100%;
                    }

                    #bbgl-panel.bbgl-no-animations :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-bright-silver.is-revealed .bbgl-rank-notch-line::before {
                        animation: none;
                        background-size: 400% 240%;
                    }

                    #bbgl-panel.bbgl-no-animations :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-gold.is-revealed .bbgl-rank-notch-line::before {
                        animation: none;
                        background-position: 50% 50%;
                    }

                    #bbgl-panel.bbgl-no-animations :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque).material-diamond.is-revealed .bbgl-rank-notch-line::before {
                        animation: none;
                        background-position: 50% 50%;
                    }

                    /* Locked bar segments use a dim engraved glyph. The off-bar capstone is the one
                       exception: its gray name stays visible so the final destination is explicit. */
                    .bbgl-rank-title.is-locked {
                        display: inline-flex;
                        color: rgba(150, 158, 158, .5);
                    }

                    .bbgl-rank-title.is-milestone.is-locked {
                        display: block;
                    }

                    .bbgl-rank-title.is-locked svg {
                        width: calc(var(--bbgl-t-fs-notch, 10px) * .9);
                        height: calc(var(--bbgl-t-fs-notch, 10px) * .9);
                    }

                    /* The live coordinate mirrors the title milestones below the groove: the same
                       recessed tick drops from the line, with a plain light numeral centred under
                       it. At an exact unlock level the upper and lower marks share one vertical. */
                    .bbgl-rank-knob {
                        position: absolute;
                        top: 50%;
                        left: var(--rank-fill-pct, 0%);
                        min-width: 0;
                        padding: calc(var(--bbgl-t-bar-h) / 2 + var(--bbgl-t-slider-tick-h) + var(--bbgl-t-slider-gap, 2px)) 1px 0;
                        box-sizing: border-box;
                        border: 0;
                        border-radius: 0;
                        transform: translateX(-50%);
                        background: none;
                        box-shadow: none;
                        cursor: help;
                        pointer-events: auto;
                        line-height: var(--bbgl-t-knob-lh, 1);
                        text-align: center;
                        z-index: 3;
                    }

                    .bbgl-rank-knob::before {
                        content: '';
                        position: absolute;
                        left: calc(50% - var(--bbgl-t-bar-h) / 2);
                        top: calc(var(--bbgl-t-bar-h) / 2);
                        width: var(--bbgl-t-bar-h);
                        height: calc(var(--bbgl-t-slider-tick-h) + var(--bbgl-t-slider-tick-grow));
                        border-radius: 999px;
                        background:
                            radial-gradient(ellipse 260% 100% at 118% 50%, rgba(150, 158, 158, .10), transparent 70%),
                            linear-gradient(90deg, #0a0d0e, #171b1c 62%, #272c2d);
                        box-shadow:
                            inset 1px 0 1.5px rgba(0, 0, 0, .85),
                            inset -1px 0 0 rgba(160, 168, 168, .10),
                            1px 0 0 rgba(150, 158, 158, .05);
                    }

                    .bbgl-rank-knob::after {
                        content: none;
                    }

                    /* Intentionally just readable text: no metal clipping, outline, extrusion or
                       glow. A single soft dark shadow keeps the light figure clear of the panel. */
                    .bbgl-rank-knob-lv {
                        position: static;
                        display: block;
                        transform: translateY(var(--bbgl-t-slider-tick-grow));
                        font-family: 'Segoe UI', Arial, sans-serif;
                        font-size: var(--bbgl-t-knob-fs);
                        font-weight: 700;
                        line-height: 1;
                        letter-spacing: 0;
                        font-variant-numeric: tabular-nums;
                        color: #d9ddda;
                        background: none;
                        -webkit-text-stroke: 0;
                        text-shadow: 0 1px 2px rgba(0, 0, 0, .9);
                        filter: none;
                        pointer-events: none;
                        white-space: nowrap;
                    }

                    /* ─── Material plaques ────────────────────────────────────────────────
                       One title per band plus Fully Bricked. The finish ladder escalates on two
                       axes: METAL (aluminium -> steel -> silver -> gold -> nacre) and WORKMANSHIP
                       (bare blank -> chamfered -> framed with a sunk field -> rivets -> milled
                       edge) — the first three tiers share a metal family and separate on
                       workmanship alone.

                       Ornament scale keys off --bbgl-t-rank-tag-cut, which already scales per panel
                       mode, so the ladder resizes without a new per-mode variable. Frame band width
                       is ADDED to --bbgl-t-rank-tag-pad-x rather than carved out of it, so inner
                       text clearance stays fixed and only the frame widens the plate. The five
                       level bands are even 20-point spans (LEVEL_TITLE_BANDS), capstone at 100. */
                    .bbgl-rank-notch {
                        --rank-frame-w: 0px;
                        --rank-sil: linear-gradient(#000, #000);
                        --rank-face: linear-gradient(180deg, #444849, #181b1c);
                        --rank-bevel: inset 0 0 0 1px rgba(92, 98, 99, .45);
                        --rank-frame: none;
                        --rank-rivets: none;
                        --rank-field: none;
                        --rank-field-shadow: none;
                        --rank-grain: none;
                        --rank-grain-a: .5;
                        /* Breathing room between the lettering and the frame band, on top of the
                           per-mode tag padding. Without it ascenders and descenders sit hard
                           against the inner field's edge on the framed tiers. */
                        --rank-pad-block: 1.5px;
                        --rank-pad-inline: 1px;
                        --rank-ink: #c4c6c3;
                        --rank-sweep-a: 0;
                        --rank-sweep-dur: 5s;
                        --rank-drop: drop-shadow(0 1px 1px rgba(0, 0, 0, .75)) drop-shadow(0 2px 3px rgba(0, 0, 0, .4));
                        position: absolute;
                        top: 50%;
                        transform: translateX(-50%);
                        pointer-events: auto;
                        cursor: help;
                        white-space: nowrap;
                        text-align: center;
                        z-index: 1;
                    }

                    /* ── Silhouette primitives. Every mask layer is FULL-BOX and opaque except at
                       its own feature, composited with intersect, so cuts compose without
                       fighting. mask (not clip-path) because clip-path cannot cut the concave
                       corners tiers 3+ use — and both would clip an outer box-shadow, which is
                       why the drop-shadow moved to a filter on the unmasked wrapper. */
                    .bbgl-rank-notch.finish-machined {
                        --rank-sil:
                            linear-gradient(135deg, transparent 0 var(--bbgl-t-rank-tag-cut), #000 var(--bbgl-t-rank-tag-cut)) 0 0/100% 100% no-repeat,
                            linear-gradient(225deg, transparent 0 var(--bbgl-t-rank-tag-cut), #000 var(--bbgl-t-rank-tag-cut)) 0 0/100% 100% no-repeat,
                            linear-gradient(45deg,  transparent 0 var(--bbgl-t-rank-tag-cut), #000 var(--bbgl-t-rank-tag-cut)) 0 0/100% 100% no-repeat,
                            linear-gradient(315deg, transparent 0 var(--bbgl-t-rank-tag-cut), #000 var(--bbgl-t-rank-tag-cut)) 0 0/100% 100% no-repeat;
                    }

                    .bbgl-rank-notch:is(.finish-polished, .finish-silver, .finish-gold, .finish-pearl) {
                        --rank-corner: calc(var(--bbgl-t-rank-tag-cut) * 1.15);
                        --rank-sil:
                            radial-gradient(circle at 0 0,       transparent 0 var(--rank-corner), #000 calc(var(--rank-corner) + .7px)) 0 0/100% 100% no-repeat,
                            radial-gradient(circle at 100% 0,    transparent 0 var(--rank-corner), #000 calc(var(--rank-corner) + .7px)) 0 0/100% 100% no-repeat,
                            radial-gradient(circle at 0 100%,    transparent 0 var(--rank-corner), #000 calc(var(--rank-corner) + .7px)) 0 0/100% 100% no-repeat,
                            radial-gradient(circle at 100% 100%, transparent 0 var(--rank-corner), #000 calc(var(--rank-corner) + .7px)) 0 0/100% 100% no-repeat;
                    }

                    /* ── T1 mill-finish aluminium. Deliberately crude — coarse bidirectional
                       grain, dead matte, no frame, blunt rectangle. This is the baseline the rest
                       of the ladder has to visibly escape, so it is the one tier that is allowed
                       to look cheap. */
                    .bbgl-rank-notch.finish-mill {
                        --rank-face: linear-gradient(179deg, #6c7274 0%, #5a6062 26%, #4b5152 52%, #565c5e 74%, #43494a 100%);
                        --rank-bevel:
                            inset 0 0 0 1px #2b3031,
                            inset 0 1px 0 rgba(255, 255, 255, .10),
                            inset 0 -1px 0 rgba(0, 0, 0, .45);
                        --rank-grain:
                            repeating-linear-gradient(0deg, rgba(255, 255, 255, .05) 0 1px, transparent 1px 2px),
                            repeating-linear-gradient(90deg, rgba(0, 0, 0, .10) 0 1px, transparent 1px 4px);
                        --rank-grain-a: .7;
                        --rank-ink: #a8adaa;
                    }

                    /* ── T2 machined steel. Chamfers, first frame band, real polish. The metal
                       ramps are deliberately 9-10 stops with abrupt value REVERSALS — a dark band
                       hard against a bright one is what reads as metal. A monotonic light-to-dark
                       fade never will, which is what the old tags all did. */
                    .bbgl-rank-notch.finish-machined {
                        --rank-frame-w: calc(var(--bbgl-t-rank-tag-cut) * .78);
                        --rank-face: linear-gradient(178deg,
                            #8f9698 0%, #c1c9ca 9%, #6e7679 24%, #3d4447 38%,
                            #566063 50%, #9ba4a6 57%, #c6cecf 63%, #5c6467 78%, #333a3d 100%);
                        --rank-bevel:
                            inset 0 0 0 1px #767d7f,
                            inset 0 1px 0 rgba(255, 255, 255, .38),
                            inset 0 -1px 0 rgba(0, 0, 0, .55);
                        --rank-frame: linear-gradient(178deg, #b4bcbe, #6d7578 55%, #464e51);
                        --rank-field-shadow: inset 0 1px 1px rgba(0, 0, 0, .5), inset 0 -1px 0 rgba(255, 255, 255, .16);
                        --rank-grain: repeating-linear-gradient(0deg, rgba(255, 255, 255, .055) 0 1px, transparent 1px 2px);
                        --rank-grain-a: .5;
                        --rank-ink: #dfe3e1;
                    }

                    /* ── T3 polished steel. Concave corners, first recessed field, first sweep. */
                    .bbgl-rank-notch.finish-polished {
                        --rank-frame-w: calc(var(--bbgl-t-rank-tag-cut) * .92);
                        --rank-face: linear-gradient(177deg,
                            #b6bfc1 0%, #e6eeef 7%, #7d8689 20%, #414a4d 33%,
                            #6c767a 45%, #b3bcbe 52%, #e2eaeb 58%, #6b7477 74%, #3a4245 89%, #8d9698 100%);
                        --rank-bevel:
                            inset 0 0 0 1px #9aa2a4,
                            inset 0 1px 0 rgba(255, 255, 255, .55),
                            inset 0 -1px 0 rgba(0, 0, 0, .5);
                        --rank-frame: linear-gradient(178deg, #eaf1f2, #8b9497 45%, #4c5457 70%, #b9c1c3);
                        --rank-field: linear-gradient(178deg, #5c6568, #8f989b 40%, #414a4d);
                        --rank-field-shadow: inset 0 1px 2px rgba(0, 0, 0, .6), inset 0 -1px 0 rgba(255, 255, 255, .22);
                        --rank-grain: repeating-linear-gradient(0deg, rgba(255, 255, 255, .06) 0 1px, transparent 1px 2px);
                        --rank-grain-a: .4;
                        --rank-ink: #f2f5f4;
                        --rank-sweep-a: .5;
                        --rank-sweep-dur: 6s;
                    }

                    /* ── T4 silver. Bright cool metal plus the first corner rivets. */
                    .bbgl-rank-notch.finish-silver {
                        --rank-frame-w: calc(var(--bbgl-t-rank-tag-cut) * 1.1);
                        --rank-face: linear-gradient(177deg,
                            #d8dedf 0%, #ffffff 7%, #98a1a4 19%, #4d5659 32%,
                            #7f898c 44%, #ccd4d5 51%, #ffffff 57%, #7d8689 74%, #454e51 90%, #aeb6b8 100%);
                        --rank-bevel:
                            inset 0 0 0 1px #dfe6e7,
                            inset 0 1px 0 rgba(255, 255, 255, .75),
                            inset 0 -1px 0 rgba(0, 0, 0, .45);
                        --rank-frame: linear-gradient(178deg, #ffffff, #a9b2b5 42%, #565f62 72%, #e2e9ea);
                        --rank-field: linear-gradient(178deg, #6f797c, #a8b1b4 40%, #4e5558);
                        --rank-field-shadow: inset 0 1px 2px rgba(0, 0, 0, .6), inset 0 -1px 0 rgba(255, 255, 255, .4);
                        --rank-rivets:
                            radial-gradient(circle at var(--rank-rivet-o) var(--rank-rivet-o), #f2f7f8 0 .9px, #5a6366 1.1px, transparent 1.7px),
                            radial-gradient(circle at calc(100% - var(--rank-rivet-o)) var(--rank-rivet-o), #f2f7f8 0 .9px, #5a6366 1.1px, transparent 1.7px),
                            radial-gradient(circle at var(--rank-rivet-o) calc(100% - var(--rank-rivet-o)), #f2f7f8 0 .9px, #5a6366 1.1px, transparent 1.7px),
                            radial-gradient(circle at calc(100% - var(--rank-rivet-o)) calc(100% - var(--rank-rivet-o)), #f2f7f8 0 .9px, #5a6366 1.1px, transparent 1.7px);
                        --rank-grain: repeating-linear-gradient(0deg, rgba(255, 255, 255, .07) 0 1px, transparent 1px 2px);
                        --rank-grain-a: .35;
                        --rank-ink: #ffffff;
                        --rank-sweep-a: .72;
                        --rank-sweep-dur: 5s;
                    }

                    /* ── T5 gold. Widest frame, milled edge, and the first outward glow.
                       The milling alphas are held at ~.10: anything above ~.18 stops reading as
                       tooling on the metal and turns the frame into a barcode. */
                    .bbgl-rank-notch.finish-gold {
                        --rank-frame-w: calc(var(--bbgl-t-rank-tag-cut) * 1.28);
                        --rank-face: linear-gradient(177deg,
                            #e8bd5c 0%, #fff3bd 7%, #b8862c 19%, #6a4610 32%,
                            #a97c25 44%, #e6bd5b 51%, #fff0b0 57%, #a2761f 74%, #5d3f0d 90%, #cfa243 100%);
                        --rank-bevel:
                            inset 0 0 0 1px #f4d581,
                            inset 0 1px 0 rgba(255, 248, 208, .6),
                            inset 0 -1px 0 rgba(0, 0, 0, .5);
                        --rank-frame: linear-gradient(178deg, #fff3bd, #d3a63f 40%, #7d5a13 70%, #f0cd6e);
                        --rank-field: linear-gradient(178deg, #8d6819, #c2963a 40%, #6b4d0f);
                        --rank-field-shadow: inset 0 1px 2px rgba(0, 0, 0, .66), inset 0 -1px 0 rgba(255, 240, 180, .35);
                        --rank-rivets: repeating-linear-gradient(90deg,
                            rgba(255, 246, 205, .10) 0 .5px,
                            rgba(110, 78, 16, .08) .5px 1.5px,
                            transparent 1.5px 3px);
                        --rank-grain: repeating-linear-gradient(0deg, rgba(255, 255, 255, .06) 0 1px, transparent 1px 2px);
                        --rank-grain-a: .35;
                        --rank-ink: #fff6d2;
                        --rank-sweep-a: .8;
                        --rank-sweep-dur: 4.5s;
                        --rank-drop: drop-shadow(0 1px 1px rgba(0, 0, 0, .75)) drop-shadow(0 0 4px rgba(240, 190, 70, .35));
                    }

                    /* ── T6 iridescent nacre. Bright shell FRAME over a DEEP field — pastel frame
                       on pastel field read as a greetings card and vanished against the panel.
                       Palette deliberately rhymes with bbgl-title-iridescent (Phase 9 titles) and
                       the diamond jewels so the capstone reads as the same family. */
                    .bbgl-rank-notch.finish-pearl {
                        --rank-frame-w: calc(var(--bbgl-t-rank-tag-cut) * 1.28);
                        --rank-face: linear-gradient(112deg, #ffffff, #a8e6f0, #f0b6d8, #fff0b8, #b9e2f2, #ffffff);
                        --rank-bevel:
                            inset 0 0 0 1px rgba(255, 255, 255, .9),
                            inset 0 1px 0 rgba(255, 255, 255, .85),
                            inset 0 -1px 0 rgba(90, 80, 110, .35);
                        --rank-frame: linear-gradient(112deg, #ffffff, #7fe4fb, #ff9fdc, #ffe98f, #8fdcf7, #ffffff);
                        --rank-field: linear-gradient(112deg, #1d2440, #2b4a63, #4a2c52, #4a4130, #253f5c, #1d2440);
                        --rank-field-shadow: inset 0 1px 3px rgba(0, 0, 0, .7), inset 0 -1px 0 rgba(255, 255, 255, .35);
                        --rank-rivets: repeating-linear-gradient(90deg,
                            rgba(255, 255, 255, .14) 0 .5px,
                            rgba(120, 190, 225, .10) .5px 1.5px,
                            transparent 1.5px 3px);
                        --rank-grain: radial-gradient(ellipse 140% 60% at 30% 20%, rgba(255, 255, 255, .5), transparent 60%);
                        --rank-grain-a: .5;
                        --rank-ink: #ffffff;
                        --rank-sweep-a: .85;
                        --rank-sweep-dur: 4s;
                        --rank-drop: drop-shadow(0 1px 1px rgba(0, 0, 0, .7)) drop-shadow(0 0 5px rgba(200, 235, 245, .45));
                    }

                    /* Positioned wrapper only. Its single job is the drop-shadow, which MUST be a
                       filter rather than a box-shadow: the mask on .bbgl-rank-notch-face below cuts
                       the silhouette, and a mask clips an outer box-shadow away entirely.

                       Centred, not left-anchored: .bbgl-rank-notch sits at the exact level it
                       names, and the plaque straddles that tick. .bbgl-rank-notch has no intrinsic
                       width of its own (its only child is this out-of-flow absolutely positioned
                       label), so this element's own left:50%/translateX(-50%) is what centres the
                       plaque's real box on the milestone. */
                    .bbgl-rank-notch-label {
                        position: absolute;
                        left: 50%;
                        transform: translateX(-50%);
                        width: max-content;
                        filter: var(--rank-drop);
                    }

                    /* The plate. Frame width is ADDED to the configured inner padding so the text
                       clearance inside the frame is unchanged from before; only the frame band
                       itself widens the plaque. */
                    .bbgl-rank-notch-face {
                        position: relative;
                        display: block;
                        box-sizing: border-box;
                        padding-block: calc(var(--bbgl-t-rank-tag-pad-y) + var(--rank-frame-w) + var(--rank-pad-block));
                        padding-inline: calc(var(--bbgl-t-rank-tag-pad-x) + var(--rank-frame-w) + var(--rank-pad-inline));
                        background: var(--rank-face);
                        box-shadow: var(--rank-bevel);
                        -webkit-mask: var(--rank-sil);
                        mask: var(--rank-sil);
                        -webkit-mask-composite: source-in;
                        mask-composite: intersect;
                        font-family: 'Fjalla One', 'Barlow Condensed', 'Arial Narrow', sans-serif;
                        font-size: var(--bbgl-t-fs-notch);
                        line-height: 1;
                        font-weight: 500;
                        letter-spacing: .025em;
                        white-space: nowrap;
                        text-align: center;
                        color: var(--rank-ink);
                        text-shadow: 0 -1px 0 rgba(0, 0, 0, .9), 0 1px 0 rgba(255, 255, 255, .1);
                    }

                    /* z-index is load-bearing: .bbgl-rank-notch-fx is positioned and would
                       otherwise paint OVER the lettering. Every label is span-wrapped in
                       achRankPlaqueLabelHTML() precisely so this can apply. */
                    .bbgl-rank-notch-line {
                        display: block;
                        white-space: nowrap;
                        position: relative;
                        z-index: 2;
                    }

                    /* Grain / patina. Sits before the lettering, distressing the metal without
                       making the letterforms themselves harder to read. */
                    .bbgl-rank-notch-face::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        z-index: 2;
                        background: var(--rank-grain);
                        opacity: var(--rank-grain-a);
                        pointer-events: none;
                    }

                    /* Travelling specular highlight. Deliberately a transform animation, NOT
                       background-position: this runs on up to five plaques at once on a page that
                       already carries the CRT transform, and only transform stays on the
                       compositor. Inherits .bbgl-rank-notch-face's mask, so light never spills
                       past the silhouette. */
                    .bbgl-rank-notch-face::after {
                        content: '';
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        z-index: 3;
                        background: linear-gradient(102deg,
                            transparent 38%,
                            rgba(255, 255, 255, calc(var(--rank-sweep-a) * .45)) 47%,
                            rgba(255, 255, 255, var(--rank-sweep-a)) 50%,
                            rgba(255, 255, 255, calc(var(--rank-sweep-a) * .45)) 53%,
                            transparent 62%);
                        transform: translateX(-105%);
                        pointer-events: none;
                    }

                    .bbgl-rank-notch.is-revealed .bbgl-rank-notch-face::after {
                        animation: bbgl-rank-sweep var(--rank-sweep-dur) ease-in-out infinite;
                        animation-delay: var(--bbgl-titles-animation-delay, 0ms);
                    }

                    @keyframes bbgl-rank-sweep {
                        0% { transform: translateX(-105%); }
                        55%, 100% { transform: translateX(105%); }
                    }

                    .bbgl-rank-notch-fx {
                        position: absolute;
                        inset: 0;
                        z-index: 1;
                        pointer-events: none;
                    }

                    /* Frame band. The ring is carved with the padding-box/border-box mask-exclude
                       trick so it hugs whatever silhouette the tier uses. Corner rivets and edge
                       milling ride in this band as extra background layers.

                       background-repeat: no-repeat is load-bearing — without it each corner-rivet
                       radial-gradient TILES across the whole band and reads as a row of studs
                       running down every edge. */
                    .bbgl-rank-notch-fx::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        border: var(--rank-frame-w) solid transparent;
                        background: var(--rank-rivets), var(--rank-frame);
                        background-repeat: no-repeat;
                        background-origin: border-box;
                        background-clip: border-box;
                        -webkit-mask: linear-gradient(#000, #000) padding-box, linear-gradient(#000, #000);
                        mask: linear-gradient(#000, #000) padding-box, linear-gradient(#000, #000);
                        -webkit-mask-composite: destination-out;
                        mask-composite: exclude;
                    }

                    /* Recessed inner field the lettering sits on. The top-inner shadow paired with
                       the bottom-inner highlight is what sells "sunk into the plate" — this plus
                       the frame band is the whole difference between a coloured rectangle and
                       something that reads as a trophy plaque. */
                    .bbgl-rank-notch-fx::after {
                        content: '';
                        position: absolute;
                        inset: var(--rank-frame-w);
                        background: var(--rank-field);
                        box-shadow: var(--rank-field-shadow);
                    }

                    .bbgl-rank-notch.finish-silver {
                        --rank-rivet-o: calc(var(--rank-frame-w) * .92);
                    }


                    /* Before unlock there is no plaque at all: only a question mark pressed into the
                       panel surface, matching the divot cut into the groove below it. The plate,
                       its frame, field and grain all arrive together with the title when
                       .is-revealed is added. */
                    .bbgl-rank-notch:not(.is-revealed) .bbgl-rank-notch-label {
                        filter: none;
                    }

                    .bbgl-rank-notch:not(.is-revealed) .bbgl-rank-notch-face {
                        padding: 0;
                        background: none;
                        box-shadow: none;
                        -webkit-mask: none;
                        mask: none;
                        color: rgba(6, 8, 8, .85);
                        text-shadow: 0 1px 0 rgba(190, 196, 190, .13), 0 -1px 1px rgba(0, 0, 0, .7);
                    }

                    .bbgl-rank-notch:not(.is-revealed) .bbgl-rank-notch-face::before,
                    .bbgl-rank-notch:not(.is-revealed) .bbgl-rank-notch-face::after {
                        content: none;
                    }

                    .bbgl-rank-notch:not(.is-revealed) .bbgl-rank-notch-fx {
                        display: none;
                    }

                    /* At the cap the pearl plaque wakes into a slow nacre drift across the plate,
                       its frame and its field together — the one place a background-position
                       animation is worth the paint cost, since it is a single element at the very
                       end of the run and the hue travel is the entire point of the effect. */
                    .bbgl-rank-notch.finish-pearl.is-bricked .bbgl-rank-notch-face,
                    .bbgl-rank-notch.finish-pearl.is-bricked .bbgl-rank-notch-fx::before,
                    .bbgl-rank-notch.finish-pearl.is-bricked .bbgl-rank-notch-fx::after {
                        background-size: 320% 100%;
                        animation: bbgl-rank-pearl 5.5s ease-in-out infinite alternate;
                        animation-delay: var(--bbgl-titles-animation-delay, 0ms);
                    }

                    @keyframes bbgl-rank-pearl {
                        from { background-position: 0% 50%; }
                        to { background-position: 100% 50%; }
                    }

                    #bbgl-panel.bbgl-no-animations .bbgl-rank-notch.finish-pearl.is-bricked .bbgl-rank-notch-face,
                    #bbgl-panel.bbgl-no-animations .bbgl-rank-notch.finish-pearl.is-bricked .bbgl-rank-notch-fx::before,
                    #bbgl-panel.bbgl-no-animations .bbgl-rank-notch.finish-pearl.is-bricked .bbgl-rank-notch-fx::after,
                    #bbgl-panel.bbgl-no-animations .bbgl-rank-notch.is-revealed .bbgl-rank-notch-face::after {
                        animation: none;
                    }

                    /* With animations off the sweep would otherwise freeze mid-plate as a static
                       white smear, so park it fully off the plaque instead. */
                    #bbgl-panel.bbgl-no-animations .bbgl-rank-notch .bbgl-rank-notch-face::after {
                        opacity: 0;
                    }

                    /* Card context for one current-rank plaque. The plaque renderer is shared with
                       the dormant trophy shelf, but every positioning rule below severs this copy
                       from the shelf coordinate system. Material, silhouette, frame, grain and
                       sweep remain the exact same implementation used by the original plaques. */
                    .bbgl-title-card-rank-plaque {
                        --rank-pad-block: calc(var(--bbgl-t-gap-v) * .85 + 1px);
                        --rank-pad-inline: calc(var(--bbgl-t-gap) * .8 + 1px);
                        position: relative;
                        top: auto;
                        left: auto;
                        display: block;
                        width: 96%;
                        height: 96%;
                        max-width: 100%;
                        transform: none;
                        margin-block: auto;
                        margin-inline: auto;
                        pointer-events: auto;
                        z-index: 1;
                    }

                    .bbgl-title-card-rank-plaque .bbgl-rank-notch-label {
                        position: relative;
                        left: auto;
                        bottom: auto;
                        display: block;
                        width: 100%;
                        height: 100%;
                        max-width: 100%;
                        transform: none;
                    }

                    .bbgl-title-card-rank-plaque .bbgl-rank-notch-face {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 100%;
                        max-width: 100%;
                        font-size: calc(var(--bbgl-t-fs-line) * 1.08);
                        line-height: 1.05;
                    }

                    /* The progress-bar finishes for silver and diamond paint the two-line rank as
                       one shared block. The card adds that same wrapper, then neutralises the bar's
                       absolute milestone positioning while leaving its typography/paint untouched. */
                    .bbgl-title-card-rank-plaque .bbgl-rank-title-text {
                        position: relative;
                        top: auto;
                        left: auto;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        transform: none;
                        z-index: 2;
                    }

                    .bbgl-title-card[data-rank-finish="mill"] .bbgl-title-card-rank-label {
                        display: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-mill {
                        container-type: size;
                        --rank-drop: none;
                        width: 88.32%;
                        height: 86.4%;
                    }

                    .bbgl-title-card-rank-plaque.finish-mill .bbgl-rank-notch-face {
                        display: grid;
                        grid-template-rows: 36% minmax(0, 1fr);
                        padding: clamp(2px, 3cqh, 4px);
                        border: 1px solid;
                        border-color: #fffefa #cecec8 #93968f #e1e2da;
                        border-radius: clamp(3px, 5cqw, 7px);
                        background: linear-gradient(165deg, #fffefa 0%, #f4f4ee 48%, #e4e5de 100%);
                        box-shadow:
                            inset 0 1px 0 #fff,
                            inset 1px 0 1px rgba(255, 255, 255, .9),
                            inset -1px 0 1px rgba(90, 96, 84, .18),
                            inset 0 -3px 1px #c0c3b9,
                            inset 0 -4px 0 rgba(255, 255, 255, .8);
                        mask: none;
                        -webkit-mask: none;
                        overflow: hidden;
                        align-items: stretch;
                        justify-content: stretch;
                    }

                    .bbgl-title-card-rank-plaque.finish-mill .bbgl-rank-notch-face::after,
                    .bbgl-title-card-rank-plaque.finish-mill .bbgl-rank-notch-fx {
                        display: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-mill .bbgl-rank-notch-face::before {
                        inset: 1px 1px 4px;
                        z-index: 3;
                        border-radius: inherit;
                        background:
                            linear-gradient(115deg, rgba(255, 255, 255, .24), transparent 42%),
                            linear-gradient(180deg, rgba(255, 255, 255, .2), transparent 22%);
                        opacity: 1;
                    }

                    .bbgl-rank-name-tag-heading {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-width: 0;
                        min-height: 0;
                        border-radius: clamp(2px, 3cqw, 4px) clamp(2px, 3cqw, 4px) 0 0;
                        background: linear-gradient(180deg, #bc4145, #ad3036);
                        box-shadow: inset 0 1px 1px rgba(86, 20, 24, .35), 0 1px 0 rgba(255, 255, 255, .9);
                        color: #fff;
                        font-family: 'Trebuchet MS', 'Segoe UI', sans-serif;
                        font-size: min(9cqw, 23cqh);
                        font-weight: 400;
                        line-height: 1;
                        letter-spacing: 0;
                        text-shadow: none;
                        white-space: nowrap;
                    }

                    .bbgl-title-card-rank-plaque.finish-mill .bbgl-rank-title-text {
                        box-sizing: border-box;
                        min-width: 0;
                        min-height: 0;
                        padding: 3px 5%;
                        font-size: min(16.5cqw, 44cqh);
                        line-height: 1.08;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-title-card-rank-plaque.finish-mill .bbgl-rank-title-text {
                        font-size: min(14.3cqw, 37.4cqh);
                    }

                    #bbgl-panel.bbgl-compact .bbgl-title-card-rank-plaque.finish-mill .bbgl-rank-notch-face {
                        padding: 1px;
                        box-shadow:
                            inset 0 1px 0 #fff,
                            inset -1px 0 1px rgba(90, 96, 84, .12),
                            inset 0 -1px 0 #c0c3b9,
                            inset 0 -2px 0 rgba(255, 255, 255, .8);
                    }

                    #bbgl-panel.bbgl-compact .bbgl-title-card-rank-plaque.finish-mill .bbgl-rank-notch-face::before {
                        bottom: 2px;
                    }

                    .bbgl-title-card[data-rank-finish="machined"] .bbgl-title-card-rank-label {
                        display: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-machined {
                        container-type: size;
                        --rank-drop: none;
                        width: 93%;
                        height: 84.5%;
                    }

                    .bbgl-title-card-rank-plaque.finish-machined .bbgl-rank-notch-face {
                        --rank-lightbox-rim: 17cqmin;
                        --rank-lightbox-thin-rim: calc(var(--rank-lightbox-rim) * .5);
                        --rank-lightbox-edge: clamp(.4px, 1cqmin, 1px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: calc(var(--rank-lightbox-rim) + 2px) calc(var(--rank-lightbox-thin-rim) + 2px) calc(var(--rank-lightbox-thin-rim) + 2px);
                        border: 0;
                        border-radius: clamp(3px, 5cqw, 7px);
                        background: linear-gradient(165deg, #7d928d, #4c6462 48%, #344b4b);
                        box-shadow: none;
                        mask: none;
                        -webkit-mask: none;
                        overflow: hidden;
                    }

                    .bbgl-title-card-rank-plaque.finish-machined .bbgl-rank-notch-fx {
                        inset: var(--rank-lightbox-thin-rim);
                        border: 1px solid #0c1011;
                        border-radius: clamp(2px, 3cqw, 4px);
                        background: linear-gradient(160deg, #1c2325, #090d0e 65%, #111719);
                        box-shadow: inset 0 1px 3px #000, 0 1px 0 rgba(255, 255, 255, .09);
                        -webkit-mask-image: radial-gradient(ellipse 34cqmin calc(var(--rank-lightbox-rim) * .65) at 50% 0, transparent calc(100% - .5px), #000 100%);
                        mask-image: radial-gradient(ellipse 34cqmin calc(var(--rank-lightbox-rim) * .65) at 50% 0, transparent calc(100% - .5px), #000 100%);
                    }

                    .bbgl-title-card-rank-plaque.finish-machined .bbgl-rank-notch-fx::before,
                    .bbgl-title-card-rank-plaque.finish-machined .bbgl-rank-notch-fx::after {
                        display: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-machined .bbgl-rank-notch-face::after {
                        inset: 0;
                        width: auto;
                        border-radius: inherit;
                        background: none;
                        box-shadow:
                            inset 0 var(--rank-lightbox-edge) 0 rgba(255, 255, 255, .65),
                            inset 0 calc(var(--rank-lightbox-edge) * -1.5) 0 rgba(24, 58, 55, .5);
                        transform: none;
                        animation: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-machined .bbgl-rank-notch-face::before {
                        inset: 0;
                        z-index: 0;
                        border-radius: inherit;
                        background: #d9dddf;
                        box-shadow:
                            inset 0 0 3px rgba(232, 239, 242, .82),
                            inset 0 0 8px rgba(216, 229, 234, .48),
                            inset 0 0 14px rgba(201, 219, 225, .20);
                        opacity: 1;
                        animation: bbgl-rank-lightbox-on 2.5s step-end 1 both;
                        animation-delay: var(--bbgl-rank-lightbox-delay, 0ms);
                    }

                    .bbgl-rank-lightbox-heading {
                        position: absolute;
                        top: 0;
                        left: 50%;
                        transform: translateX(-50%);
                        z-index: 2;
                        display: flex;
                        align-items: center;
                        height: var(--rank-lightbox-rim);
                        padding: 0;
                        font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
                        font-size: min(calc(var(--rank-lightbox-rim) * 1.12), 22cqw);
                        font-weight: 500;
                        line-height: 1;
                        letter-spacing: .16em;
                        color: #263c39;
                        text-shadow: none;
                    }

                    .bbgl-rank-lightbox-heading > span {
                        display: block;
                        text-box-trim: trim-both;
                        text-box-edge: cap alphabetic;
                    }

                    .bbgl-title-card-rank-plaque.finish-machined .bbgl-rank-title-text {
                        min-width: 0;
                        min-height: 0;
                        font-size: min(13cqw, 25cqh);
                        line-height: 1.12;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-title-card-rank-plaque.finish-machined .bbgl-rank-title-text {
                        font-size: min(15cqw, 28cqh);
                    }

                    @keyframes bbgl-rank-lightbox-on {
                        0%, 30%, 33%, 40%, 45%, 64%, 74% { opacity: 0; }
                        30.01%, 38%, 44% { opacity: .25; }
                        53%, 72% { opacity: .65; }
                        76%, 100% { opacity: 1; }
                    }

                    #bbgl-panel.bbgl-no-animations .bbgl-title-card-rank-plaque.finish-machined .bbgl-rank-notch-face::before {
                        animation: none;
                        opacity: 1;
                    }

                    .bbgl-title-card[data-rank-finish="polished"] .bbgl-title-card-rank-label {
                        display: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-polished {
                        container-type: size;
                        --rank-drop: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-polished .bbgl-rank-notch-face {
                        padding: 0;
                        border: 0;
                        border-radius: 0;
                        mask: none;
                        -webkit-mask: none;
                        overflow: visible;
                        background: none;
                        box-shadow: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-polished .bbgl-rank-notch-fx,
                    .bbgl-title-card-rank-plaque.finish-polished .bbgl-rank-notch-face::before,
                    .bbgl-title-card-rank-plaque.finish-polished .bbgl-rank-notch-face::after {
                        display: none;
                    }

                    .bbgl-rank-bronze-plaque {
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        height: 100%;
                        overflow: visible;
                        filter: drop-shadow(0 2px 2px rgba(0, 0, 0, .45));
                    }

                    .bbgl-rank-bronze-heading {
                        position: absolute;
                        top: 13%;
                        left: 50%;
                        transform: translateX(-50%);
                        z-index: 2;
                        font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
                        font-size: min(12cqw, 16cqh);
                        font-weight: 700;
                        line-height: 1;
                        letter-spacing: .16em;
                        padding-left: .16em;
                        color: #000;
                        text-shadow: 0 -.5px 0 rgba(43, 23, 12, .8), 0 1px 0 rgba(244, 199, 138, .75);
                    }

                    .bbgl-title-card-rank-plaque.finish-polished .bbgl-rank-title-text {
                        position: absolute;
                        top: 33%;
                        left: 10%;
                        width: 80%;
                        height: 50%;
                        min-width: 0;
                        min-height: 0;
                        max-width: 100%;
                        font-size: min(10cqw, 20cqh);
                        line-height: 1.1;
                    }

                    .bbgl-title-card[data-rank-finish="silver"] .bbgl-title-card-rank-label {
                        display: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-silver {
                        container-type: size;
                        --rank-drop: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-silver .bbgl-rank-notch-face {
                        --rank-silver-shield-outline: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M50 2 C60 2 65 11 77 12 L88 12 Q96 12 96 21 L94 49 C92 70 75 86 50 98 C25 86 8 70 6 49 L4 21 Q4 12 12 12 L23 12 C35 11 40 2 50 2Z'/%3E%3C/svg%3E");
                        padding: 23cqh 10cqw 23cqh;
                        background: linear-gradient(155deg, #f9ffff 0%, #aebbc0 15%, #eef5f8 23%, #59666d 35%, #d9e5ea 46%, #fff 49%, #87969e 57%, #34434d 73%, #c1d0d8 87%, #f2f9fc 100%);
                        box-shadow: none;
                        mask: var(--rank-silver-shield-outline) center / 100% 100% no-repeat;
                        -webkit-mask: var(--rank-silver-shield-outline) center / 100% 100% no-repeat;
                        overflow: hidden;
                    }

                    .bbgl-title-card-rank-plaque.finish-silver .bbgl-rank-notch-fx {
                        inset: 3cqmin;
                        mask: var(--rank-silver-shield-outline) center / 100% 100% no-repeat;
                        -webkit-mask: var(--rank-silver-shield-outline) center / 100% 100% no-repeat;
                        background: linear-gradient(165deg, #cad5da 0%, #74838b 19%, #3d4c55 36%, #637680 55%, #a2b2bb 65%, #44545e 83%, #8c9ca5 100%);
                        box-shadow: inset 0 1px 1px rgba(255, 255, 255, .8);
                    }

                    .bbgl-title-card-rank-plaque.finish-silver .bbgl-rank-notch-fx::before {
                        content: '';
                        position: absolute;
                        inset: 18cqh 5cqw 9cqh;
                        border: 0;
                        border-radius: 0;
                        mask: var(--rank-silver-shield-outline) center / 100% 100% no-repeat;
                        -webkit-mask: var(--rank-silver-shield-outline) center / 100% 100% no-repeat;
                        background: linear-gradient(165deg, #46565f, #293943 58%, #536770);
                        box-shadow: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-silver .bbgl-rank-notch-fx::after {
                        content: '';
                        display: block;
                        position: absolute;
                        inset: 0;
                        border: 0;
                        box-shadow: none;
                        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath fill='none' stroke='%23d6e3eb' stroke-width='.65' d='M33 17 C27 19 22 19 14 19 Q10 19 10 24 L12 48 C14 66 29 80 50 91 C71 80 86 66 88 48 L90 24 Q90 19 86 19 C78 19 73 19 67 17'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
                        opacity: .75;
                    }

                    .bbgl-title-card-rank-plaque.finish-silver .bbgl-rank-notch-face::before {
                        background: repeating-linear-gradient(0deg, rgba(255, 255, 255, .035) 0 .5px, transparent .5px 3px);
                        opacity: .35;
                    }

                    .bbgl-rank-silver-shield-heading {
                        position: absolute;
                        top: 5cqh;
                        left: 50%;
                        transform: translateX(-50%);
                        z-index: 2;
                        font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
                        font-size: min(11cqw, 13cqh);
                        font-weight: 600;
                        line-height: 1;
                        letter-spacing: .12em;
                        color: #283841;
                        text-shadow: 0 1px 0 rgba(240, 249, 255, .65);
                    }

                    .bbgl-title-card-rank-plaque.finish-silver .bbgl-rank-title-text {
                        min-width: 0;
                        min-height: 0;
                        max-width: 100%;
                        font-size: min(10.5cqw, 26cqh);
                        line-height: 1.2;
                    }

                    .bbgl-shield-letter-seats {
                        position: absolute;
                        inset: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        z-index: 0;
                        pointer-events: none;
                    }

                    .bbgl-shield-letter-seat {
                        position: relative;
                        display: block;
                        white-space: nowrap;
                        font-weight: 400;
                        color: transparent;
                        -webkit-text-fill-color: transparent;
                        -webkit-text-stroke: .075em #34454d;
                        text-shadow: 0 .045em 0 rgba(197, 215, 224, .55);
                    }

                    .bbgl-shield-letter-seat::after {
                        content: attr(data-rank-text);
                        position: absolute;
                        inset: 0;
                        color: transparent;
                        -webkit-text-fill-color: transparent;
                        -webkit-text-stroke: 0;
                        text-shadow:
                            .012em .018em 0 #267858,
                            .024em .036em 0 #15553d,
                            .036em .054em 0 #093e2d;
                    }
                    .bbgl-rank-silver-shield-jewels {
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 1;
                        pointer-events: none;
                    }

                    .bbgl-title-card[data-rank-finish="gold"] .bbgl-title-card-rank-label {
                        display: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-gold {
                        container-type: size;
                        --rank-drop: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-gold .bbgl-rank-notch-face {
                        padding: 0;
                        background: none;
                        box-shadow: none;
                        mask: none;
                        -webkit-mask: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-gold .bbgl-rank-notch-face::before,
                    .bbgl-title-card-rank-plaque.finish-gold .bbgl-rank-notch-face::after,
                    .bbgl-title-card-rank-plaque.finish-gold .bbgl-rank-notch-fx {
                        display: none;
                    }

                    .bbgl-rank-gold-crown {
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                    }

                    .bbgl-title-card-rank-plaque.finish-gold .bbgl-rank-title-text {
                        position: absolute;
                        top: 34%;
                        left: 17%;
                        width: 66%;
                        height: 40%;
                        min-width: 0;
                        min-height: 0;
                        font-size: min(10cqw, 17cqh);
                        line-height: 1.08;
                    }

                    .bbgl-rank-crown-heading {
                        position: absolute;
                        top: 83%;
                        left: 50%;
                        transform: translateX(-50%);
                        z-index: 2;
                        font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
                        font-size: min(10cqw, 12cqh);
                        font-weight: 700;
                        line-height: 1;
                        letter-spacing: .14em;
                        color: #5b340c;
                        text-shadow: 0 1px 0 rgba(255, 242, 178, .8);
                    }

                    .bbgl-title-card[data-rank-finish="pearl"] .bbgl-title-card-rank-label {
                        display: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-pearl {
                        container-type: size;
                        --rank-drop: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-pearl .bbgl-rank-notch-face {
                        padding: 0;
                        background: none;
                        box-shadow: none;
                        mask: none;
                        -webkit-mask: none;
                    }

                    .bbgl-title-card-rank-plaque.finish-pearl .bbgl-rank-notch-fx,
                    .bbgl-title-card-rank-plaque.finish-pearl .bbgl-rank-notch-face::before,
                    .bbgl-title-card-rank-plaque.finish-pearl .bbgl-rank-notch-face::after {
                        display: none;
                    }

                    .bbgl-rank-pearl-marquee {
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                    }

                    .bbgl-title-card-rank-plaque.finish-pearl .bbgl-rank-title-text {
                        position: absolute;
                        top: 31%;
                        left: 18%;
                        width: 64%;
                        height: 43%;
                        min-width: 0;
                        min-height: 0;
                        font-size: min(17cqw, 23cqh);
                        line-height: 1.06;
                    }

                    .bbgl-rank-marquee-heading {
                        position: absolute;
                        top: 86%;
                        left: 50%;
                        transform: translateX(-50%);
                        z-index: 2;
                        font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
                        font-size: min(9cqw, 10cqh);
                        font-weight: 700;
                        line-height: 1;
                        letter-spacing: .16em;
                        color: #50425d;
                        text-shadow: 0 1px 0 rgba(255, 255, 255, .8);
                    }

                    .bbgl-marquee-bulb {
                        animation: bbgl-marquee-ignite .35s ease-out both;
                        animation-delay: calc(var(--bbgl-titles-animation-delay, 0ms) + var(--bulb-delay));
                    }

                    .bbgl-marquee-lamp {
                        filter: drop-shadow(0 0 2px var(--bulb-color));
                    }

                    .bbgl-marquee-beams {
                        mix-blend-mode: screen;
                        animation: bbgl-marquee-ignite 1.2s ease-out both;
                        animation-delay: calc(var(--bbgl-titles-animation-delay, 0ms) + 650ms);
                    }

                    @keyframes bbgl-marquee-ignite {
                        from { opacity: .12; }
                        to { opacity: 1; }
                    }

                    #bbgl-panel.bbgl-no-animations .bbgl-marquee-bulb,
                    #bbgl-panel.bbgl-no-animations .bbgl-marquee-beams {
                        animation: none;
                    }

                    /* ─── Unlock blocks, one per stat ──────────────────────────────────
                       One in each corner (str top-left, def top-right, spd bottom-left, dex
                       bottom-right — grouped into .bbgl-titles-corner-col pairs above) rather than a
                       shared 2x2 grid. Each block's own 10 stars split 5 over 5 — see
                       .bbgl-title-stars/.bbgl-title-star-row below. */

                    /* The composed title reuses the tooltip's title element so both places pick up
                       the same per-word finish rules (see .bbgl-title-word below). */
                    .bbgl-lvl-title.bbgl-titles-title {
                        font-family: 'Fjalla One', 'Barlow Condensed', 'Arial Narrow', sans-serif;
                        font-style: normal;
                        font-weight: 400;
                        color: #aaa;
                        text-shadow: 0 0 2px rgba(0, 0, 0, .65);
                        line-height: 1.55;
                    }

                    /* One block per stat: name on top, its own row of tier stars below.
                       Deliberately NOT a container: inline-size containment computes width without
                       looking at contents, so it would report 0 contribution to its parent column,
                       collapsing it. Sizing measures against .bbgl-titles-page instead — the page's
                       width is set by the panel, independent of this layout, so there's no
                       circularity. --bbgl-t-win-color feeds the glowing "window" chrome, set per
                       stat below. position:relative anchors the SVG frame and the stat-name label
                       straddling the top border.

                       margin-top reserves room for that label: it's absolutely positioned straddling
                       the block's own top edge, so the column has no idea it exists and would
                       otherwise let the label collide with whatever's above. Derived from the
                       label's own font size so retuning it keeps the clearance correct on its own. */
                    .bbgl-title-block {
                        position: relative;
                        margin-top: var(--bbgl-t-label-clear);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: var(--bbgl-t-block-gap);
                        min-width: 0;
                    }

                    /* Per-stat colour, plus a deliberately non-round hum period each so the four
                       tubes never pulse in unison — real neon in a row never does. */
                    .bbgl-title-block.ach-stat-str { --bbgl-t-win-color: #3264c6; --bbgl-t-win-hum: 7.3s; }
                    .bbgl-title-block.ach-stat-def { --bbgl-t-win-color: #dc3912; --bbgl-t-win-hum: 8.9s; }
                    .bbgl-title-block.ach-stat-spd { --bbgl-t-win-color: #ff9900; --bbgl-t-win-hum: 6.7s; }
                    .bbgl-title-block.ach-stat-dex { --bbgl-t-win-color: #109618; --bbgl-t-win-hum: 9.7s; }

                    /* ─── Stat-block neon windows ───────────────────────────────────────
                       Each stat block uses a neon tube bent around its two star rows, with curved
                       corners rather than a notched HUD look.

                       The frame/glow are drawn by ::before and the interior texture by ::after,
                       neither on the element itself — 'filter' applies to an element's whole
                       rendered subtree, so a drop-shadow directly on the block would re-glow every
                       star and letter inside it. Confining the filter to a childless pseudo keeps
                       the glow on the tube and off the contents; both pseudos sit at z-index:-1 so
                       they paint behind the content.

                       The panel's ambient CRT texture (scanlines/vignette, glass glare) already
                       sits behind this content, so it reads through the window's open interior for
                       free — ::after adds only a second TINTED layer confined to this window: same
                       cadence, recoloured, with a radial bleed brightest at the rim, reading as
                       "this patch of glass is lit by this colour" rather than a second card stacked
                       on top.

                       Reads as neon rather than a coloured border for two reasons: the LINE is
                       near-white with only a tint of the stat colour, the COLOUR lives in the glow
                       around it (real tubes are white-hot at the core); and the glow is three
                       stacked drop-shadows (tight core -> mid bloom -> wide haze) rather than one
                       blur, since a single blur reads as smudged where a falloff reads as lit. */
                    .bbgl-title-block {
                        padding: var(--bbgl-t-win-pad);
                        box-sizing: border-box;
                        border-radius: var(--bbgl-t-win-radius);
                    }

                    /* Stat blocks only (not the identity card) tighten up top/bottom beyond the
                       shared padding above — the card's own line-stack has no similar slack to
                       reclaim, but each block was leaving visible dead space above/below its two
                       star rows. Declared after the shared rule so it wins on just these two
                       sides; horizontal padding (and everything about the card) is untouched. */
                    .bbgl-title-block {
                        padding-top: var(--bbgl-t-win-pad-y);
                        padding-bottom: var(--bbgl-t-win-pad-y);
                    }

                    /* Animated rank names (emerald/bright-silver, gold, diamond) on their own layer. Their
                       shine can't be moved to a transform — it's a gradient clipped to the letters with
                       background-clip:text, plus a blurred glow copy — so it repaints every frame no matter
                       what. On its own layer only the name itself is redrawn, instead of everything under
                       its glow reach (plaque grain, rivets, frame bands, the rank track). The line is
                       already a stacking context (position:relative; z-index:2 below), so its ::before glow
                       still stacks exactly as before. */
                    :is(.bbgl-rank-title, .bbgl-title-card-rank-plaque):is(.material-bright-silver, .material-gold, .material-diamond).is-revealed .bbgl-rank-notch-line {
                        will-change: transform;
                    }

                    /* The lit glass inside it. inset:1px keeps the texture off the tube's own line so
                       the two don't blur into each other at small sizes. */
                    .bbgl-title-block::after {
                        content: '';
                        position: absolute;
                        inset: 1px;
                        z-index: -1;
                        border-radius: inherit;
                        pointer-events: none;
                        background:
                            radial-gradient(ellipse 118% 118% at 50% 50%, transparent 34%, color-mix(in srgb, var(--bbgl-t-win-color) 13%, transparent) 100%),
                            repeating-linear-gradient(0deg, transparent 0 2px, color-mix(in srgb, var(--bbgl-t-win-color) 9%, transparent) 2px 4px);
                        -webkit-mask-image: radial-gradient(ellipse 130% 130% at 50% 50%, rgba(0, 0, 0, .25) 20%, #000 100%);
                        mask-image: radial-gradient(ellipse 130% 130% at 50% 50%, rgba(0, 0, 0, .25) 20%, #000 100%);
                    }

                    /* Mains hum — a slow, shallow breath on the tube only (the texture underneath
                       holds steady). Amplitude is deliberately small: five of these are on screen at
                       once, and anything more visible would fight the rank bar's shine sweep and the
                       stars' own glow for attention. */
                    @keyframes bbgl-neon-hum {
                        0%, 100% { opacity: 1; }
                        50% { opacity: .84; }
                    }

                    #bbgl-panel.bbgl-no-animations .bbgl-title-card::before,
                    #bbgl-panel.bbgl-no-animations .bbgl-titles-name {
                        animation: none;
                    }

                    /* ─── Stat-name label ────────────────────────────────────────────
                       Straddles the block's own top border line directly — no plate, no wires. The
                       outline (.bbgl-plate-neon) leaves a notch in its top edge for this label, so the
                       tube reads as terminating right into the letters rather than running behind/through them —
                       replaces the old hanging-plate sign, which was a deliberately opposite,
                       occluding read next to an open frame; this instead reads as ONE continuous
                       neon object, tube and text alike, cursive text being the natural "handwritten
                       in light" analogue of a bent glass tube. translate(-50%,-50%) centres the
                       label on the same y=0 line the frame's gap sits on, then the extra -2.5px
                       lifts it very slightly further up off that line — a small deliberate offset
                       (not derived from font-size) so a bit more of the glyphs sit above the block's
                       box than below, rather than an exact half/half split. --bbgl-t-label-clear
                       below adds the same 2.5px to its own reservation so the lift doesn't eat into
                       the clearance it was accounting for. */
                    .bbgl-title-block-label {
                        position: absolute;
                        top: 0;
                        left: 50%;
                        transform: translate(-50%, calc(-50% - 2.5px));
                        color: color-mix(in srgb, var(--bbgl-t-win-color) 38%, #fff);
                        text-shadow:
                            0 0 1px color-mix(in srgb, var(--bbgl-t-win-color) 55%, #fff),
                            0 0 calc(4px * var(--bbgl-t-win-glow)) color-mix(in srgb, var(--bbgl-t-win-color) 75%, transparent);
                        /* Dancing Script (bold, loaded via the fonts link in injectStyles()) is a
                           real connected script drawn to stay legible at small sizes — unlike a
                           system script font (Segoe Script/Brush Script MT, now just the fallback
                           chain for the instant before the webfont loads), it doesn't thin out into
                           illegible hairlines at 8-12px, which is what "neon tube lettering" needs
                           to actually read at this scale. No text-transform/letter-spacing here (the
                           old plate had both) — forcing uppercase/tracking on a script face breaks
                           its letter joins and reads as broken caps rather than stylish;
                           achStatFull() already returns mixed-case text ("Strength" etc.), so this
                           needed no JS-side change either. */
                        font-family: 'Dancing Script', 'Segoe Script', 'Brush Script MT', cursive;
                        font-size: var(--bbgl-t-fs-block-label);
                        font-weight: 700;
                        line-height: 1;
                        text-align: center;
                        white-space: nowrap;
                        cursor: help;
                    }

                    /* Two rows of 5 — stacked and centred. Flex (not grid) because a grid's column
                       tracks add nothing here: both rows have the same star count, so a plain
                       centred flex column is simpler than a grid for no loss of alignment. */
                    .bbgl-title-stars {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        row-gap: var(--bbgl-t-star-rgap);
                        min-width: 0;
                    }

                    .bbgl-title-star-row {
                        display: flex;
                        column-gap: var(--bbgl-t-star-cgap);
                    }

                    /* Keep the two rows in normal flow. The old negative margin closed the crown
                       artwork's optical air, but it also overlapped the square interaction boxes
                       between rows, making the shared edge target whichever row painted last. */
                    .bbgl-title-star-row + .bbgl-title-star-row {
                        margin-top: 0;
                    }

                    /* Explicitly sized off --bbgl-t-star rather than stretching to fill a track —
                       flex would otherwise size each star to a fraction of its row, making the
                       5-star row's stars different sizes if the two rows ever went uneven. Width,
                       height and flex-basis share one token so the tooltip/click-target element is
                       one invariant square in every mode.

                       overflow:hidden keeps a star's own glow from bleeding into its neighbour: the
                       1-5px gaps between stars are far less than a drop-shadow's blur radius, so
                       clipping at each cell's own edge is what keeps two adjacent glowing crowns
                       from merging into one hazy rectangle.

                       Height is shorter than width (unlike an equal-square cell) to close some of
                       the row-to-row gap for real. width/flex-basis stay at the full --bbgl-t-star
                       so horizontal spacing and the crown's rendered size are untouched — the
                       crown's aspect ratio already renders at ~68% of a square cell's height, so
                       trimming the cell to 90% still leaves it comfortably inside. */
                    .bbgl-title-star {
                        position: relative;
                        width: var(--bbgl-t-star);
                        height: calc(var(--bbgl-t-star) * .9);
                        flex: 0 0 var(--bbgl-t-star);
                        touch-action: manipulation;
                        -webkit-tap-highlight-color: transparent;
                        overflow: hidden;
                    }

                    /* -base and -fill are two copies of the SAME crown outline (ICONS.TITLE_CROWN),
                       stacked exactly on top of one another. -base is a dim grey outline, always
                       fully drawn regardless of lock state — the "track" the trace fills against.
                       -fill is the bright stat-coloured trace: stroke-dasharray'd to the crown
                       outline's own real length, then revealed counterclockwise from the crown's
                       top spike via --star-fill, a bare 0-1 fraction stamped inline per star (see
                       achTitleStarHTML, 06-section-v-logic.js) reflecting E banked toward that tier
                       — 0 for untouched locked tiers, a growing fraction as E is spent toward the
                       very next locked one, 1 for unlocked tiers. Same partial-progress mechanic as
                       the old clip-path fill, just an outline sweep instead of a bottom-up reveal.
                       Sized to 96% of the cell (not the full 100%) — just enough margin left for
                       the glow to render before the cell's own overflow:hidden clips it, no more.
                       Both sides are the same 96% and the icon renders completely undistorted — no
                       preserveAspectRatio="none" stretch. Width is still the binding dimension
                       under default "meet" scaling (the crown's viewBox, 307x217, is a little
                       wider than tall), so the crown doesn't fill the full 96% height — that's
                       deliberate margin, not a bug. */
                    .bbgl-title-star-base,
                    .bbgl-title-star-fill {
                        position: absolute;
                        inset: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        pointer-events: none;
                    }

                    .bbgl-title-star-base svg,
                    .bbgl-title-star-fill svg {
                        width: 96%;
                        height: 96%;
                        display: block;
                        overflow: visible;
                    }

                    /* Stroke width is a calc() dividing a fixed px target back through
                       --bbgl-t-star instead of a flat px value, to counter the fact that the SVG's
                       own viewBox-to-render scaling would otherwise make the stroke thicker in page
                       mode and thinner in compact — this fakes the "constant on-screen thickness"
                       job vector-effect:non-scaling-stroke would normally do (that property is
                       avoided here entirely, see ICONS.TITLE_CROWN above, since it silently breaks
                       stroke-dashoffset on this same element). The constant (415.73) is
                       targetOnscreenPx * viewBoxWidth / .96, i.e. the inverse of how the 96%-sized,
                       307-wide viewBox actually scales into a --bbgl-t-star-wide square cell —
                       width, not height, is the constraining dimension since the crown's viewBox is
                       wider than it is tall. Re-derive both this and -fill's constant below if the
                       icon svg's width/height percentage (currently 96%, above) OR its viewBox width
                       (currently 307, ICONS.TITLE_CROWN above) ever changes. */
                    .bbgl-title-star-base svg path {
                        stroke: rgba(200, 205, 215, .28);
                        stroke-width: calc(415.73px / var(--bbgl-t-star));
                    }

                    /* Stat-coloured neon trace, deliberately the SAME recipe as the window-frame
                       tube around the enclosing .bbgl-title-block (see .bbgl-title-block::before
                       below) rather than a scaled-down variant — same line-colour formula (a 42%
                       mix of --bbgl-t-win-color into near-white, not a flat stat colour) and the
                       same 3-stack drop-shadow px values (1 / 4*glow / 11*glow), also threaded
                       through the same --bbgl-t-win-glow per-mode dimming knob. Line WIDTH still
                       has to be its own thing (see stroke-width below) since the border is a flat
                       1px and this needs to scale with --bbgl-t-star across modes — but the width
                       target matches -base's 1.3px exactly, so the two strokes are the same
                       thickness and the trace can't show the grey base peeking out past its edges. */
                    .bbgl-title-star-fill svg path {
                        stroke: color-mix(in srgb, var(--bbgl-t-win-color, #ffcc44) 42%, rgba(255, 255, 255, .92));
                        stroke-width: calc(415.73px / var(--bbgl-t-star));
                        /* 980.10 is the crown outline's own real length (numerically integrated
                           over its Bezier segments, in the same user units as the viewBox — re-measure
                           this if ICONS.TITLE_CROWN's path data ever changes again) — dashing against
                           the path's real length instead of a pathLength-normalised 0-1 fraction is
                           what keeps this working with vector-effect dropped (see ICONS.TITLE_CROWN
                           above). --star-fill is a bare 0-1 fraction stamped inline per star
                           (achTitleStarHTML, 06-section-v-logic.js). */
                        stroke-dasharray: 980.10;
                        stroke-dashoffset: calc(980.10 * (1 - var(--star-fill, 0)));
                        transition: stroke-dashoffset .5s ease;
                        filter:
                            drop-shadow(0 0 1px color-mix(in srgb, var(--bbgl-t-win-color, #ffcc44) 55%, #fff))
                            drop-shadow(0 0 calc(4px * var(--bbgl-t-win-glow, 1)) color-mix(in srgb, var(--bbgl-t-win-color, #ffcc44) 55%, transparent))
                            drop-shadow(0 0 calc(11px * var(--bbgl-t-win-glow, 1)) color-mix(in srgb, var(--bbgl-t-win-color, #ffcc44) 26%, transparent));
                    }

                    #bbgl-panel.bbgl-no-animations .bbgl-title-star-fill svg path {
                        transition: none;
                    }

                    .bbgl-title-star.is-unlocked {
                        cursor: pointer;
                    }

                    .bbgl-title-star.is-locked {
                        cursor: help;
                    }

                    body:not(.is-touch-device) .bbgl-title-star.is-unlocked:hover .bbgl-title-star-fill svg path {
                        filter:
                            drop-shadow(0 0 1px color-mix(in srgb, var(--bbgl-t-win-color, #ffcc44) 55%, #fff))
                            drop-shadow(0 0 calc(4px * var(--bbgl-t-win-glow, 1)) color-mix(in srgb, var(--bbgl-t-win-color, #ffcc44) 55%, transparent))
                            drop-shadow(0 0 calc(11px * var(--bbgl-t-win-glow, 1)) color-mix(in srgb, var(--bbgl-t-win-color, #ffcc44) 26%, transparent))
                            drop-shadow(0 0 1px rgba(255, 255, 255, .6));
                    }

                    /* Equipped stars — currently supplying a word in the composed title. The
                       OUTLINE stays the block's own stat colour (unchanged from an ordinary
                       unlocked star); only the crown's interior gets a translucent purple wash, so
                       equip status reads as "this crown is lit from the inside" rather than
                       recolouring the neon itself. is-secondary is the FIRST word (the adjective)
                       and also what a half-finished pick wears while it waits for its second click;
                       is-primary is the second word (the noun); is-both blends both. These stars
                       are always .is-unlocked (only unlocked stars are clickable), so the fill is
                       static — it never needs to interact with the trace/dashoffset animation. */
                    .bbgl-title-star.is-primary .bbgl-title-star-fill svg path {
                        fill: color-mix(in srgb, #a855f7 55%, transparent);
                    }

                    .bbgl-title-star.is-secondary .bbgl-title-star-fill svg path {
                        fill: color-mix(in srgb, #d8b4fe 55%, transparent);
                    }

                    .bbgl-title-star.is-both .bbgl-title-star-fill svg path {
                        fill: color-mix(in srgb, #c084fc 55%, transparent);
                    }

                    .bbgl-titles-main {
                        isolation: isolate;
                    }

                    #bbgl-panel .bbgl-titles-page {
                        display: grid;
                        grid-template-rows: minmax(0, 78fr) minmax(34px, 22fr);
                        margin: 0 8px;
                        height: 100%;
                        padding: 0 0 2px;
                        z-index: 0;
                        gap: 3px;
                    }

                    #bbgl-panel #bbgl-achievements-container.bbgl-ach-titles-page {
                        position: absolute;
                        top: var(--bbgl-t-toolbar-bottom, var(--bbgl-toolbar-h));
                        bottom: 2px;
                        left: 0;
                        right: 0;
                        height: auto;
                        padding-top: 0;
                    }

                    .bbgl-titles-board {
                        position: relative;
                        isolation: isolate;
                        display: grid;
                        grid-template-rows: minmax(0, 1fr);
                        padding-top: 6px;
                        box-sizing: border-box;
                        flex: 1 1 0;
                        min-height: 0;
                        overflow: hidden;
                    }

                    .bbgl-titles-name-row {
                        --bbgl-t-win-color: #a855f7;
                        --bbgl-t-win-glow: 1.3;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-width: 0;
                        min-height: 0;
                        padding: 0 8px;
                        box-sizing: border-box;
                    }

                    .bbgl-titles-name-row .bbgl-titles-name {
                        flex: 0 0 auto;
                        max-width: none;
                        font-size: var(--bbgl-name-fit, 18px);
                        line-height: 1.4;
                        padding-bottom: 0;
                        transform: none;
                        overflow: visible;
                        text-overflow: clip;
                    }

                    .bbgl-titles-card-area {
                        position: relative;
                        margin-inline: 1px;
                        min-width: 0;
                        min-height: 0;
                    }

                    #bbgl-panel .bbgl-titles-board .bbgl-titles-main {
                        --bbgl-t-min-card-gap: 6px;
                        --bbgl-t-center-min: 80px;
                        position: absolute;
                        inset: 0;
                        top: 0;
                        height: 100%;
                        margin: 0;
                        padding: 0 calc(var(--bbgl-t-min-card-gap) + 1px);
                        grid-template-columns: minmax(0, 1fr) minmax(calc(var(--bbgl-t-center-min) * 1.16505), 1fr) minmax(0, 1fr);
                        column-gap: calc(var(--bbgl-t-min-card-gap) + 3px);
                        grid-template-rows: 100%;
                        transform: none;
                    }

                    #bbgl-panel .bbgl-titles-main .bbgl-titles-center {
                        margin: 0;
                        transform: none;
                        height: calc(100% - var(--bbgl-title-height-trim, 0px));
                        align-self: center;
                        width: max(var(--bbgl-t-center-min), min(calc(100% / 1.16505), var(--bbgl-title-max-width, 132px)));
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-titles-board .bbgl-titles-main {
                        --bbgl-t-center-min: 88px;
                        padding-inline: calc(var(--bbgl-t-min-card-gap) + 1px);
                        column-gap: calc(var(--bbgl-t-min-card-gap) + 3px);
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-titles-board .bbgl-titles-main {
                        --bbgl-t-center-min: 88px;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-titles-main .bbgl-titles-center {
                        width: max(var(--bbgl-t-center-min), min(calc(100% / 1.16505), var(--bbgl-title-max-width, 132px)));
                        height: calc(100% - var(--bbgl-title-height-trim, 0px));
                        align-self: center;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-titles-page {
                        margin-inline: 8px;
                    }

                    /* The two stat cards still hug the top and bottom corners, but not flush: the
                       column is a five-row grid (edge spacer, card, middle spacer, card, edge spacer)
                       and the space the cards leave over is shared out by fr. Each edge takes
                       --bbgl-t-corner-edge of it against the middle's 1, so the cards step in toward
                       the plaque's vertical centre by the same proportion in every mode, without
                       changing size (the star size is set from the row height and column width in
                       layoutTitleBlockFrames(), 07-section-vi-ui.js, not from where the cards sit).
                       0fr restores the old flush space-between; larger values pull them further in.
                       The middle keeps the old 3px floor between the cards. fr rows cannot go
                       negative, so a short panel collapses the spacers rather than overflowing. */
                    #bbgl-panel .bbgl-titles-main .bbgl-titles-corner-col {
                        --bbgl-t-emblem-scale: 1.12;
                        --bbgl-t-corner-edge: .25fr;
                        height: calc(100% - var(--bbgl-title-height-trim, 0px));
                        align-self: center;
                        margin: 0;
                        padding: 0;
                        transform: none;
                        width: 100%;
                        display: grid;
                        grid-template-rows: var(--bbgl-t-corner-edge) auto minmax(3px, 1fr) auto var(--bbgl-t-corner-edge);
                        grid-template-columns: minmax(0, 1fr);
                        justify-items: center;
                        gap: 0;
                    }

                    #bbgl-panel .bbgl-titles-main .bbgl-titles-corner-col::before,
                    #bbgl-panel .bbgl-titles-main .bbgl-titles-corner-col::after {
                        content: '';
                    }

                    #bbgl-panel .bbgl-titles-main .bbgl-titles-corner-col::before {
                        grid-row: 1;
                    }

                    #bbgl-panel .bbgl-titles-main .bbgl-titles-corner-col > .bbgl-title-block:first-child {
                        grid-row: 2;
                    }

                    #bbgl-panel .bbgl-titles-main .bbgl-titles-corner-col > .bbgl-title-block:last-child {
                        grid-row: 4;
                    }

                    #bbgl-panel .bbgl-titles-main .bbgl-titles-corner-col::after {
                        grid-row: 5;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-titles-main .bbgl-titles-corner-col {
                        height: calc(100% - var(--bbgl-title-height-trim, 0px));
                        align-self: center;
                    }

                    #bbgl-panel .bbgl-rank-scale {
                        height: 100%;
                        min-height: 0;
                    }

                    #bbgl-panel .bbgl-rank-track {
                        min-height: 0;
                        align-items: stretch;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-titles-main {
                        grid-template-rows: 94%;
                    }

                    .bbgl-rank-line {
                        background: var(--bbgl-t-tick-color);
                        box-shadow: none;
                        border-radius: 0;
                        --bbgl-rank-visual-drop: calc(var(--bbgl-t-fs-notch, 10px) * .6);
                        translate: 0 var(--bbgl-rank-visual-drop);
                    }

                    /* Rank ticks: a short ruler tick every second level, a tall one under each
                       milestone title, and the live (purple) tick, as plain elements placed by
                       percentage (achRankTicksHTML(), 06-section-v-logic.js).
                       Pure CSS, no layout pass. Each rises from the groove's bottom edge, centred on
                       its level. --bbgl-t-tick-color is softer than black and shared with the groove,
                       so every line stays one style; solid rather than translucent, so a tick does not
                       darken where it overlaps the groove. */
                    .bbgl-rank-ticks {
                        position: absolute;
                        inset: 0;
                        pointer-events: none;
                    }

                    /* --bbgl-t-tick-draw scales how tall the ruler ticks are DRAWN, and
                       --bbgl-t-tick-draw-tall the milestone and live ticks, without touching
                       --bbgl-t-tick-h, which the title text is placed from, so the ticks grow up
                       toward the titles while the titles stay put. */
                    .bbgl-rank-line {
                        --bbgl-t-tick-draw: 2.5;
                        --bbgl-t-tick-draw-tall: 1.6;
                        --bbgl-t-tick-color: #131313;
                        /* Tick width. At a fractional display scale a 1px tick lands as 1 or 2 device
                           px depending on where it falls; wider values hide that rounding better. */
                        --bbgl-t-tick-w: 1px;
                    }

                    .bbgl-rank-tick {
                        position: absolute;
                        bottom: 0;
                        width: var(--bbgl-t-tick-w);
                        height: calc(var(--bbgl-t-tick-h) * .45 * var(--bbgl-t-tick-draw));
                        margin-left: calc(var(--bbgl-t-tick-w) / -2);
                        background: var(--bbgl-t-tick-color);
                    }

                    .bbgl-rank-tick:is(.is-milestone, .is-live) {
                        height: calc(var(--bbgl-t-tick-h) * var(--bbgl-t-tick-draw-tall));
                    }

                    /* The live tick: a milestone tick in purple, placed at --rank-fill-pct. Last in
                       the markup and lifted, so it covers a milestone at an exact unlock level. */
                    .bbgl-rank-tick.is-live {
                        left: var(--rank-fill-pct, 0%);
                        background: #bb85e5;
                        z-index: 1;
                    }

                    /* The milestone ticks are drawn by .bbgl-rank-ticks now, so the title's own
                       pseudo-element tick is retired rather than drawn twice. */
                    .bbgl-rank-title.is-milestone::after {
                        content: none;
                    }

                    .bbgl-rank-knob {
                        top: 100%;
                        padding: 2px 1px 0;
                    }

                    .bbgl-rank-knob::before {
                        content: none;
                    }

                    .bbgl-rank-knob-lv {
                        transform: none;
                    }

                    #bbgl-panel .bbgl-titles-corner-col {
                        align-self: stretch;
                        justify-content: center;
                        margin-top: var(--bbgl-t-stack-frame-offset);
                        gap: 2px;
                        padding-block: 3px;
                        box-sizing: border-box;
                    }

                    .bbgl-title-block {
                        margin-top: 0;
                        padding: var(--bbgl-stat-padding-y, 0px) 0;
                        padding-bottom: calc(var(--bbgl-stat-padding-y, 0px) + 2px);
                        gap: 0;
                        isolation: isolate;
                    }

                    .bbgl-title-block::before {
                        content: '';
                        position: absolute;
                        top: -3px;
                        bottom: 0;
                        left: -3px;
                        right: -3px;
                        z-index: -1;
                        pointer-events: none;
                        border-radius: 4px;
                        mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath fill='white' d='M4 16H23C27 16 27 2 34 2H66C73 2 73 16 77 16H96Q100 16 100 22V94Q100 100 96 100H4Q0 100 0 94V22Q0 16 4 16Z'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
                        background:
                            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M0 22Q0 16 4 16H23C27 16 27 2 34 2H66C73 2 73 16 77 16H96Q100 16 100 22' fill='none' stroke='%23c4cdd1' stroke-opacity='.42' stroke-width='2' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E") center / 100% 100% no-repeat,
                            radial-gradient(circle at 4px calc(16% + 4px), #d5dde2 0 .7px, #68747d .9px 1.7px, #202930 1.9px 2.5px, transparent 2.8px),
                            radial-gradient(circle at calc(100% - 4px) calc(16% + 4px), #d5dde2 0 .7px, #68747d .9px 1.7px, #202930 1.9px 2.5px, transparent 2.8px),
                            radial-gradient(circle at 4px calc(100% - 4px), #a3abb0 0 .7px, #50595f .9px 1.7px, #11171b 1.9px 2.5px, transparent 2.8px),
                            radial-gradient(circle at calc(100% - 4px) calc(100% - 4px), #a3abb0 0 .7px, #50595f .9px 1.7px, #11171b 1.9px 2.5px, transparent 2.8px),
                            radial-gradient(ellipse at 50% 20%, color-mix(in srgb, var(--bbgl-t-win-color) 16%, transparent), transparent 75%),
                            linear-gradient(115deg, #121619 0%, #1c2226 18%, #2b3339 24%, #1c2227 32%, #14181b 49%, #20272b 72%, #2e353b 78%, #151b1f 100%);
                        box-shadow:
                            inset 0 1px 0 #c4cdd16b,
                            inset 1px 0 0 #9aa6ad38,
                            inset -1px 0 0 #10161980,
                            inset 0 -1px 0 #c4cdd16b;
                    }

                    .bbgl-plate-neon {
                        position: absolute;
                        top: -3px;
                        left: -3px;
                        width: calc(100% + 6px);
                        height: calc(100% + 3px);
                        overflow: visible;
                        pointer-events: none;
                        z-index: 1;
                        fill: none;
                        stroke: color-mix(in srgb, var(--bbgl-t-win-color) 42%, #fff);
                        stroke-width: 1px;
                        filter:
                            drop-shadow(0 0 1px var(--bbgl-t-win-color))
                            drop-shadow(0 0 3px color-mix(in srgb, var(--bbgl-t-win-color) 70%, transparent))
                            drop-shadow(0 0 6px color-mix(in srgb, var(--bbgl-t-win-color) 30%, transparent));
                    }

                    .bbgl-plate-neon path {
                        vector-effect: non-scaling-stroke;
                    }

                    .bbgl-title-block::after {
                        content: none;
                    }

                    .bbgl-title-block-label {
                        position: relative;
                        left: auto;
                        transform: translateY(-1px);
                        padding: 1px 0 0;
                        border: 0;
                        background: none;
                        box-shadow: none;
                        color: color-mix(in srgb, var(--bbgl-t-win-color) 38%, #fff);
                        font-family: 'Dancing Script', 'Segoe Script', 'Brush Script MT', cursive;
                        font-size: calc(var(--bbgl-t-fs-block-label) * .8);
                        text-shadow:
                            0 0 1px color-mix(in srgb, var(--bbgl-t-win-color) 55%, #fff),
                            0 0 calc(4px * var(--bbgl-t-win-glow)) color-mix(in srgb, var(--bbgl-t-win-color) 75%, transparent);
                        letter-spacing: 0;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-title-block-label {
                        transform: translateY(-1.5px);
                    }

                    .bbgl-title-block-label::before {
                        content: none;
                        position: absolute;
                        inset: -2px -7px -2px;
                        z-index: -1;
                        pointer-events: none;
                        border-radius: 9px 9px 0 0;
                        background:
                            radial-gradient(ellipse at 50% 20%, color-mix(in srgb, var(--bbgl-t-win-color) 16%, transparent), transparent 75%),
                            repeating-linear-gradient(0deg, #ffffff05 0 1px, #0000000a 1px 2px, transparent 2px 4px),
                            linear-gradient(115deg, #343b40, #42494e 40%, #30373c);
                        box-shadow: inset 0 1px 0 #c4cdd16b, inset 1px 0 0 #9aa6ad38, inset -1px 0 0 #10161980;
                    }

                    .bbgl-title-star-row {
                        column-gap: calc(var(--bbgl-t-star-cgap) * .65);
                    }

                    .bbgl-title-stars {
                        row-gap: calc(2px + var(--bbgl-stat-row-extra, 0px));
                    }

                    .bbgl-stat-emblem {
                        color: #434b53;
                        display: block;
                        width: 100%;
                        height: 100%;
                        overflow: visible;
                        pointer-events: none;
                        transform: scale(1.05);
                        transform-origin: center;
                    }

                    @container bbgl-panel (min-width:500px) {
                        #bbgl-panel.bbgl-expanded .bbgl-stat-emblem {
                            transform: scale(1.03);
                        }
                    }

                    @container bbgl-page (min-width:784px) {
                        #bbgl-panel.bbgl-mode-page .bbgl-stat-emblem {
                            transform: scale(1.03);
                        }
                    }

                    .bbgl-emblem-relief {
                        fill: #192128;
                        stroke: none;
                        transform: translateY(2px);
                        filter: drop-shadow(0 .4px .3px #080d12b3);
                    }

                    .bbgl-emblem-body {
                        stroke: none;
                        opacity: 1;
                        filter: drop-shadow(0 -.55px 0 #c0cbd180) drop-shadow(0 .65px 0 #101820);
                    }

                    .bbgl-emblem-detail {
                        fill: none;
                        stroke: #aeb9c3;
                        stroke-width: 1.5;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                        opacity: .25;
                    }

                    .bbgl-emblem-gloss {
                        stroke: none;
                        opacity: .15;
                    }

                    .bbgl-title-star.is-unlocked .bbgl-stat-emblem {
                        color: color-mix(in srgb, var(--bbgl-t-win-color) 65%, #84919d);
                    }

                    .bbgl-title-star.is-unlocked .bbgl-emblem-gloss {
                        opacity: .85;
                    }

                    .bbgl-title-star.is-unlocked .bbgl-emblem-detail {
                        stroke: #d6dce0;
                        opacity: .75;
                        filter: drop-shadow(0 1px 0 #101820);
                    }

                    .bbgl-emblem-trace {
                        fill: none;
                        stroke: color-mix(in srgb, var(--bbgl-t-win-color) 42%, #fff);
                        stroke-width: 1.8;
                        stroke-linecap: round;
                        stroke-linejoin: round;
                        stroke-dasharray: 100;
                        stroke-dashoffset: calc(100 * (1 - var(--star-fill, 0)));
                        transition: stroke-dashoffset .5s ease;
                        filter:
                            drop-shadow(0 0 .6px var(--bbgl-t-win-color))
                            drop-shadow(0 0 1.5px color-mix(in srgb, var(--bbgl-t-win-color) 75%, transparent))
                            drop-shadow(0 0 3px color-mix(in srgb, var(--bbgl-t-win-color) 35%, transparent));
                    }

                    .bbgl-title-star.is-unlocked .bbgl-emblem-body {
                        opacity: 1;
                    }

                    /* Selected (in the equipped title): lit well past a plain unlocked emblem so
                       the pick reads at a glance - richer stat colour, strong gloss and detail,
                       and a glow in the stat colour around the whole emblem. */
                    .bbgl-title-star:is(.is-primary, .is-secondary, .is-both) .bbgl-stat-emblem {
                        color: color-mix(in srgb, var(--bbgl-t-win-color) 85%, #fff);
                        filter:
                            drop-shadow(0 0 1.5px color-mix(in srgb, var(--bbgl-t-win-color) 90%, #fff))
                            drop-shadow(0 0 4px color-mix(in srgb, var(--bbgl-t-win-color) 60%, transparent));
                    }

                    .bbgl-title-star:is(.is-primary, .is-secondary, .is-both) .bbgl-emblem-body {
                        filter: brightness(1.4) saturate(1.2) drop-shadow(0 -.55px 0 #e6eef2a0) drop-shadow(0 .65px 0 #101820);
                    }

                    .bbgl-title-star:is(.is-primary, .is-secondary, .is-both) .bbgl-emblem-gloss {
                        opacity: 1;
                    }

                    .bbgl-title-star:is(.is-primary, .is-secondary, .is-both) .bbgl-emblem-detail {
                        stroke: #fff;
                        opacity: .95;
                    }

                    #bbgl-panel.bbgl-no-animations .bbgl-emblem-trace {
                        transition: none;
                    }

                    .bbgl-title-star {
                        width: calc(var(--bbgl-t-star) * var(--bbgl-t-emblem-scale, 1.12));
                        flex-basis: calc(var(--bbgl-t-star) * var(--bbgl-t-emblem-scale, 1.12));
                        overflow: visible;
                    }

                    .bbgl-title-star-base svg path {
                        fill: #302b24;
                        stroke: #8c8069;
                        filter: drop-shadow(0 1px 0 #d1b98066) drop-shadow(0 2px 1px #000b);
                    }

                    .bbgl-title-star-fill svg path {
                        stroke: color-mix(in srgb, var(--bbgl-t-win-color) 65%, #eee0bb);
                        filter: drop-shadow(0 1px 0 #0009);
                    }

                    .bbgl-title-star.is-unlocked .bbgl-title-star-base svg path {
                        fill: color-mix(in srgb, var(--bbgl-t-win-color) 70%, #25211b);
                        stroke: #c7b48b;
                    }

                    body:not(.is-touch-device) .bbgl-title-star.is-unlocked:hover .bbgl-title-star-fill svg path {
                        filter: drop-shadow(0 -1px 0 #fff7) drop-shadow(0 2px 1px #000b);
                    }

                    .bbgl-title-card {
                        box-shadow: inset 1px 1px 0 #ba8a6438, inset -1px -1px 0 #000b, inset 0 0 0 3px #10080447, 0 3px 5px #000b;
                    }

                    .bbgl-ach-title-row {
                        position: relative;
                        width: 100%;
                        box-sizing: border-box;
                        display: flex;
                        align-items: center;
                        border-bottom: 1px solid rgba(255, 255, 255, .12);
                        padding: 2px 2px 1px 2px;
                    }

                    .bbgl-ach-title-row .bbgl-ach-section-title {
                        width: auto;
                        border-bottom: none;
                        padding: 0;
                    }

                    .bbgl-ach-section-title {
                        cursor: pointer;
                        position: relative;
                        z-index: 2;
                        width: 100%;
                        box-sizing: border-box;
                        background: 0 0;
                        box-shadow: none;
                        border-radius: 0;
                        margin: 0;
                        padding: 2px;
                        color: #9a9a9a;
                        font-family: var(--bbgl-ach-font);
                        font-size: var(--bbgl-ach-fs-row);
                        font-weight: 700;
                        letter-spacing: .10em;
                        text-transform: uppercase;
                        line-height: 1.25;
                        border-bottom: 1px solid rgba(255, 255, 255, .12);
                        transition: color .15s;
                    }

                    .bbgl-ach-subsection-title {
                        cursor: pointer;
                        position: relative;
                        z-index: 2;
                        width: 100%;
                        box-sizing: border-box;
                        background: 0 0;
                        border: none;
                        box-shadow: none;
                        border-radius: 0;
                        margin: 0;
                        padding: 0px 2px 0px 2px;
                        color: #888;
                        font-family: var(--bbgl-ach-font);
                        font-size: var(--bbgl-ach-fs-subtitle);
                        font-weight: 600;
                        letter-spacing: .08em;
                        text-transform: uppercase;
                        line-height: 1.2;
                        transition: color .15s;
                    }

                    body:not(.is-touch-device) .bbgl-ach-section-title:hover,
                    body:not(.is-touch-device) .bbgl-ach-subsection-title:hover {
                        color: #c8c8c8;
                    }

                    .bbgl-ach-cols {
                        display: grid;
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                        column-gap: clamp(8px, calc(8px + 10px * var(--bbgl-dock-t, 0)), 18px);
                        row-gap: 0;
                        align-items: start;
                        width: 100%;
                        box-sizing: border-box;
                        padding: 0px 0 2px;
                    }

                    @container bbgl-ach (max-width:360px) {
                        .bbgl-ach-cols {
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                        }
                    }

                    .bbgl-ach-col {
                        display: flex;
                        flex-direction: column;
                        gap: 0;
                        min-width: 0;
                        text-align: left;
                    }

                    .bbgl-ach-dual {
                        width: 100%;
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                    }

                    .bbgl-ach-dual-headers {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        column-gap: clamp(8px, calc(8px + 10px * var(--bbgl-dock-t, 0)), 18px);
                        border-bottom: 1px solid rgba(255, 255, 255, .12);
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .bbgl-ach-dual .bbgl-ach-section-title {
                        border-bottom: none;
                        padding-bottom: 4px;
                    }

                    .bbgl-ach-dual-body {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        column-gap: clamp(8px, calc(8px + 10px * var(--bbgl-dock-t, 0)), 18px);
                        align-items: start;
                        width: 100%;
                        box-sizing: border-box;
                        padding: 0px 0 2px;
                    }

                    .bbgl-ach-col-half {
                        display: flex;
                        flex-direction: column;
                        gap: 0;
                        min-width: 0;
                    }

                    #bbgl-panel.bbgl-compact {
                        --bbgl-ach-fs-row-compact: clamp(9px, 1.7cqi, 11px);
                    }

                    .bbgl-ach-row {
                        display: flex;
                        flex-direction: column;
                        align-items: stretch;
                        padding: var(--bbgl-ach-row-pad-v, 4px) 2px;
                        margin: 0;
                        border: none;
                        box-shadow: none;
                        background: 0 0;
                        cursor: pointer;
                        position: relative;
                        font-size: var(--bbgl-ach-fs-row-compact, clamp(11px, 2.05cqi, 12px));
                        line-height: 1.4;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-ach-row {
                        font-size: var(--bbgl-ach-fs-row);
                        color: #ccc;
                        transition: background-color .12s;
                        border-bottom: 1px solid rgba(255, 255, 255, .04);
                    }

                    body:not(.is-touch-device) .bbgl-ach-row:hover {
                        background: rgba(255, 255, 255, .04);
                    }

                    .ach-row-main {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 6px;
                        width: 100%;
                    }

                    .ach-k-stack {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        flex: 1;
                        min-width: 0;
                    }

                    .bbgl-ach-row .ach-k {
                        font-weight: 500;
                        color: #bbb;
                        font-family: var(--bbgl-ach-font);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        width: 100%;
                    }

                    .ach-v-wrap {
                        display: flex;
                        align-items: flex-end;
                        gap: 3px;
                        flex-shrink: 0;
                        justify-content: flex-end;
                    }

                    .ach-sub {
                        font-size: var(--bbgl-ach-fs-hint);
                        font-weight: 600;
                        color: #222;
                        letter-spacing: .3px;
                        text-shadow: 0 1px 0 rgba(255, 255, 255, .05);
                        line-height: 1.1;
                        margin-bottom: 1px;
                    }

                    .bbgl-ach-row .ach-value {
                        font-weight: 500;
                        color: #eaeaea;
                        text-align: right;
                        white-space: nowrap;
                        font-family: var(--bbgl-ach-val-font);
                        font-variant-numeric: tabular-nums;
                        display: inline-flex;
                        align-items: center;
                        justify-content: flex-end;
                        flex-wrap: nowrap;
                        gap: 4px;
                        padding-right: 12px;
                    }

                    .bbgl-ach-row .ach-value .view-std,
                    .bbgl-ach-row .ach-value .view-exp {
                        font-weight: 550;
                    }

                    .ach-null {
                        color: #888;
                        font-weight: 600;
                        text-shadow: 0 1px 1px rgba(0, 0, 0, .65);
                    }

                    .ach-unit {
                        display: none;
                    }

                    .bbgl-ach-row .ach-value.ach-happy-col {
                        display: none;
                        color: #eaeaea;
                    }

                    /* .ach-enh-od (the OD sub-row's negative H/E value, both in compact) reuses
                       .ach-happy-col purely for its spacing, and would otherwise inherit the
                       compact-mode hide above meant for the regular "+X Happy" figure on the row
                       above it - which doesn't fit in compact width, unlike this one. The extra
                       class outranks the base hide without !important. */
                    .bbgl-ach-row .ach-value.ach-happy-col.ach-enh-od {
                        display: inline-flex;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-ach-row .ach-value.ach-happy-col {
                        display: inline-flex;
                        min-width: clamp(4.5em, calc(4.5em + 1em * var(--bbgl-dock-t, 0)), 5.5em);
                    }

                    .bbgl-ach-row .ach-value.ach-enh-gained {
                        display: none;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-ach-row .ach-value.ach-enh-gained {
                        display: inline-flex;
                        min-width: clamp(4.5em, calc(4.5em + 1em * var(--bbgl-dock-t, 0)), 5.5em);
                    }

                    /* OD sub-rows are detail-only: hidden in the compact panel, shown in
                       expanded panel and page mode. */
                    .bbgl-ach-od-row {
                        display: none;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-ach-od-row {
                        display: flex;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .ach-unit {
                        display: inline;
                    }

                    .ach-date {
                        display: none;
                        font-size: var(--bbgl-ach-fs-date);
                        font-weight: 500;
                        color: #999;
                        font-family: var(--bbgl-ach-font);
                        text-align: left;
                        margin-left: 6px;
                        line-height: 1;
                        letter-spacing: .01em;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .ach-date {
                        display: block;
                    }

                    .ach-fx-green {
                        background: linear-gradient(135deg, #2e7d32, #66bb6a, #81c784, #66bb6a, #2e7d32);
                        background-size: 200% 100%;
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: bbgl-ach-shimmer 4s linear 1, bbgl-ach-glow-green 4s ease-out 1 forwards;
                    }

                    .ach-fx-gold {
                        background: linear-gradient(135deg, #b8860b, #ffd700, #fffacd, #ffd700, #b8860b);
                        background-size: 200% 100%;
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: bbgl-ach-shimmer 4s linear 1, bbgl-ach-glow-gold 4s ease-out 1 forwards;
                    }

                    .ach-fx-holo {
                        background: linear-gradient(90deg, #00e5ff, #d500f9, #2979ff, #00e5ff);
                        background-size: 200% 100%;
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: bbgl-ach-shimmer 4s linear 1;
                    }

                    .ach-fx-diamond {
                        background: linear-gradient(110deg, #ffffff 0%, #ffb8d9 15%, #fff0c2 30%, #b8ffd9 45%, #b8e0ff 60%, #d9b8ff 75%, #ffb8e6 90%, #ffffff 100%);
                        background-size: 200% 100%;
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: bbgl-ach-shimmer 4s linear 1, bbgl-ach-glow-diamond 4s ease-out 1 forwards;
                    }

                    @keyframes bbgl-ach-glow-diamond {
                        0% {
                            filter: drop-shadow(0 1px 1px rgba(0, 0, 0, .8));
                        }

                        100% {
                            filter: drop-shadow(0 0 4px rgba(255, 255, 255, .9)) drop-shadow(0 0 8px rgba(255, 180, 220, .7)) drop-shadow(0 0 12px rgba(180, 220, 255, .6)) drop-shadow(0 1px 1px rgba(0, 0, 0, .8));
                        }
                    }

                    @keyframes bbgl-ach-shimmer {
                        0% {
                            background-position: 200% 0;
                        }

                        100% {
                            background-position: 0 0;
                        }
                    }

                    @keyframes bbgl-ach-glow-gold {
                        0% {
                            text-shadow: 0 0 0 rgba(255, 215, 0, 0), 0 1px 2px rgba(0, 0, 0, .8);
                        }

                        100% {
                            text-shadow: 0 0 12px rgba(255, 215, 0, .6), 0 0 20px rgba(255, 215, 0, .3), 0 1px 2px rgba(0, 0, 0, .8);
                        }
                    }

                    @keyframes bbgl-ach-glow-green {
                        0% {
                            text-shadow: 0 0 0 rgba(46, 125, 50, 0), 0 1px 2px rgba(0, 0, 0, .8);
                        }

                        100% {
                            text-shadow: 0 0 12px rgba(102, 187, 106, .6), 0 0 20px rgba(46, 125, 50, .3), 0 1px 2px rgba(0, 0, 0, .8);
                        }
                    }

                    #bbgl-panel.bbgl-no-animations :is(.ach-fx-green, .ach-fx-gold, .ach-fx-holo, .ach-fx-diamond) {
                        animation: none;
                    }

                    #bbgl-ach-pageindicator {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: var(--bbgl-ach-dot-gap);
                        padding: 0;
                        flex-shrink: 0;
                    }

                    /* position:relative + an invisible ::before hit-box below — scoped to the
                       achievements AND stickerbook pagination specifically (not the shared base
                       .pg-dot, which .pg-dot-sponsor and anything else bare still uses) since the
                       visible dot is still only --bbgl-ach-dot-w across, too small a tap target on
                       its own even at its new bigger size. Both containers share this one rule set
                       rather than each carrying their own copy — see #bbgl-sticker-pagination-bar's
                       own comment further up this file for why. */
                    #bbgl-ach-pageindicator .pg-dot,
                    #bbgl-sticker-pagination .pg-dot,
                    #bbgl-lib-pagination .pg-dot {
                        position: relative;
                        width: var(--bbgl-ach-dot-w);
                        height: var(--bbgl-ach-dot-w);
                    }

                    #bbgl-ach-pageindicator .pg-dot::before,
                    #bbgl-sticker-pagination .pg-dot::before,
                    #bbgl-lib-pagination .pg-dot::before {
                        content: '';
                        position: absolute;
                        /* Kept under half the dot-to-dot gap (--bbgl-ach-dot-gap) so adjacent dots'
                           hit-boxes don't overlap into each other's territory and steal taps meant
                           for the neighbour. */
                        inset: -3px;
                        border-radius: 50%;
                    }

                    #bbgl-ach-pageindicator .pg-dot.active,
                    #bbgl-sticker-pagination .pg-dot.active,
                    #bbgl-lib-pagination .pg-dot.active {
                        transform: scale(1.2);
                        box-shadow: 0 0 clamp(3px, calc(3px + 5px * var(--bbgl-dock-t, 0)), 8px) rgba(255, 255, 255, .5);
                    }

                    /* Brightens the dot itself (base .pg-dot is rgba(255,255,255,.25), .active is a
                       solid #fff) rather than a glow around it — a step toward .active's own
                       brightness, not a second visual language. No scale, no box-shadow: this reads
                       as "the dot itself is lighting up," matching .active's own colour treatment
                       instead of introducing a separate glow-based hover language. Doesn't apply to
                       an already-active dot (already at full brightness). */
                    body:not(.is-touch-device) #bbgl-ach-pageindicator .pg-dot:not(.active):hover,
                    body:not(.is-touch-device) #bbgl-sticker-pagination .pg-dot:not(.active):hover,
                    body:not(.is-touch-device) #bbgl-lib-pagination .pg-dot:not(.active):hover {
                        background: rgba(255, 255, 255, .6);
                    }

                    /* ─── The stickerbook's sponsorship dot ──────────────────────────────
                       Gold at rest, not only while selected: this dot marks WHERE the sponsorship
                       page is, so it has to read as gold from every other page too.

                       Declared after the shared dot rules above (not next to the other sponsor
                       styling further up this file) since several of those are ID-scoped — same ID
                       scope + later position is what lets this win the cascade without !important.
                       Colour/emphasis only; size and hit-box come from the shared rules. */
                    #bbgl-sticker-pagination .pg-dot.pg-dot-sponsor {
                        background: linear-gradient(135deg, #b8860b, #ffd700, #fffacd, #ffd700, #b8860b);
                        opacity: .55;
                    }

                    body:not(.is-touch-device) #bbgl-sticker-pagination .pg-dot.pg-dot-sponsor:not(.active):hover {
                        opacity: .82;
                    }

                    #bbgl-sticker-pagination .pg-dot.pg-dot-sponsor.active {
                        opacity: 1;
                        box-shadow: 0 0 6px rgba(255, 215, 0, .85);
                        transform: scale(1.3);
                    }

                    .bbgl-ach-section-page0 {
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .bbgl-ach-section-page0 .bbgl-ach-grid-header,
                    .bbgl-ach-section-page0 .bbgl-ach-row-multi {
                        display: grid;
                        grid-template-columns: minmax(0, 20%) repeat(4, minmax(0, 1fr));
                        column-gap: clamp(4px, calc(4px + 6px * var(--bbgl-dock-t, 0)), 10px);
                        align-items: start;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .bbgl-ach-section-page0 .bbgl-ach-grid-header {
                        border-bottom: 1px solid rgba(255, 255, 255, .12);
                        padding: 2px 2px 2px;
                        align-items: end;
                    }

                    .bbgl-ach-section-page0 .bbgl-ach-row-multi {
                        padding: var(--bbgl-ach-row-pad-v, 4px) 2px;
                        border-bottom: 1px solid rgba(255, 255, 255, .04);
                        cursor: pointer;
                    }

                    .bbgl-ach-section-page0 .bbgl-ach-row-multi:last-child {
                        border-bottom: none;
                    }

                    .ach-grid-label-area {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        min-width: 0;
                        text-align: left;
                    }

                    .bbgl-ach-section-page0 .ach-grid-label-area .ach-k {
                        font-weight: 500;
                        color: #bbb;
                        font-family: var(--bbgl-ach-font);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        width: 100%;
                        line-height: 1.25;
                    }

                    .bbgl-ach-section-page0 .bbgl-ach-grid-header .ach-grid-label-area {
                        display: grid;
                        grid-template-columns: auto minmax(0, 1fr);
                        column-gap: 6px;
                        align-items: center;
                    }

                    .bbgl-ach-section-page0 .bbgl-ach-grid-header .bbgl-ach-section-title {
                        border-bottom: none;
                        padding: 0;
                        background: transparent;
                        display: inline-block;
                        cursor: pointer;
                        line-height: 1.15;
                        white-space: normal;
                        word-break: normal;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-ach-section-page0 .bbgl-ach-grid-header .bbgl-ach-section-title {
                        white-space: nowrap;
                    }

                    .ach-stat-header {
                        font-family: var(--bbgl-ach-font);
                        font-size: var(--bbgl-ach-fs-label);
                        font-weight: 700;
                        letter-spacing: .04em;
                        text-align: center;
                        line-height: 1.2;
                    }

                    .bbgl-ach-stat-cell {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        min-width: 0;
                        cursor: pointer;
                        padding: 1px 2px;
                        border-radius: 2px;
                        transition: background-color .12s;
                    }

                    body:not(.is-touch-device) .bbgl-ach-stat-cell:hover {
                        background: rgba(255, 255, 255, .06);
                    }

                    .bbgl-ach-stat-cell .ach-value {
                        font-weight: 500;
                        color: #eaeaea;
                        text-align: center;
                        white-space: nowrap;
                        width: 100%;
                        font-family: var(--bbgl-ach-val-font);
                        font-variant-numeric: tabular-nums;
                        line-height: 1.2;
                        display: inline-flex;
                        justify-content: center;
                        align-items: baseline;
                        gap: 2px;
                        padding: 0;
                    }

                    .bbgl-ach-stat-cell .ach-date {
                        display: none;
                        font-family: var(--bbgl-ach-font);
                        font-size: var(--bbgl-ach-fs-date);
                        color: #999;
                        text-align: center;
                        margin: 1px 0 0;
                        line-height: 1.15;
                        font-weight: 500;
                        letter-spacing: .01em;
                    }

                    .bbgl-ach-stat-cell .ach-time {
                        display: none;
                        font-family: var(--bbgl-ach-val-font);
                        font-size: var(--bbgl-ach-fs-time);
                        color: #888;
                        text-align: center;
                        margin: 0;
                        line-height: 1.15;
                        font-variant-numeric: tabular-nums;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-ach-stat-cell :is(.ach-date, .ach-time) {
                        display: block;
                    }

                    .ach-streak-days {
                        color: #bbb;
                        font-weight: 500;
                        font-family: var(--bbgl-ach-val-font);
                        font-variant-numeric: tabular-nums;
                    }

                    .ach-streak-sep {
                        color: #666;
                        margin: 0 2px;
                        font-weight: 500;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-ach-section-page0 .bbgl-ach-grid-header,
                    #bbgl-panel.bbgl-compact .bbgl-ach-section-page0 .bbgl-ach-row-multi {
                        grid-template-columns: minmax(0, 28%) repeat(4, minmax(0, 1fr));
                    }

                    #bbgl-panel.bbgl-compact .bbgl-ach-section-title {
                        font-size: clamp(10px, 2cqi, 12px);
                    }

                    #bbgl-panel.bbgl-compact .bbgl-ach-subsection-title {
                        font-size: clamp(9px, 1.6cqi, 10px);
                    }

                    #bbgl-panel.bbgl-compact .ach-sub {
                        font-size: 7.5px;
                    }

                    #bbgl-panel.bbgl-compact .ach-stat-header {
                        font-size: 9px;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-ach-consistency-row .bbgl-ach-consistency-text {
                        font-size: 10px;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-ach-section-hh .bbgl-ach-row {
                        font-size: var(--bbgl-ach-fs-row-compact) !important;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-ach-hh-best-row {
                        font-size: var(--bbgl-ach-fs-row-compact);
                    }

                    #bbgl-panel.bbgl-compact .bbgl-ach-hh-val {
                        font-size: 11px;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-ach-hh-tag {
                        font-size: 8px;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-ach-hh-date-line {
                        font-size: 10px;
                    }

                    .bbgl-ach-section-page1 .ach-streak-date {
                        grid-column: 1;
                        text-align: left;
                        margin: 0;
                        padding-left: 15%;
                        padding-right: 4px;
                        line-height: 1.15;
                        white-space: nowrap;
                        overflow: visible;
                    }

                    .ach-streak-days-inline {
                        display: inline;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .ach-streak-days-inline {
                        display: none;
                    }

                    .bbgl-ach-section-page1 .bbgl-ach-grid-header,
                    .bbgl-ach-section-page1 .bbgl-ach-row-multi {
                        grid-template-columns: minmax(0, 28%) repeat(5, minmax(0, 1fr));
                    }

                    .bbgl-ach-section-page1 .bbgl-ach-stat-cell-total .ach-value {
                        color: #ffffff !important;
                    }

                    .bbgl-ach-section-page1 .bbgl-ach-stat-cell:not(.bbgl-ach-stat-cell-total) .ach-value {
                        color: #cccccc;
                    }

                    .bbgl-ach-streak-date-inline {
                        display: inline;
                        color: #888;
                        font-family: var(--bbgl-ach-val-font);
                        font-weight: 500;
                        font-variant-numeric: tabular-nums;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-ach-streak-date-inline {
                        display: none;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-ach-section-page1 .bbgl-ach-grid-header,
                    #bbgl-panel.bbgl-compact .bbgl-ach-section-page1 .bbgl-ach-row-multi {
                        grid-template-columns: minmax(0, 1fr) repeat(4, 0fr) auto;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-ach-section-page1 .bbgl-ach-stat-cell:not(.bbgl-ach-stat-cell-total),
                    #bbgl-panel.bbgl-compact .bbgl-ach-section-page1 .ach-stat-header:not(.ach-stat-tot) {
                        display: none;
                    }

                    #bbgl-panel.bbgl-compact .bbgl-ach-section-page1 .bbgl-ach-stat-cell-total .ach-value {
                        text-align: right;
                        justify-content: flex-end;
                    }

                    .bbgl-ach-consistency-row {
                        cursor: pointer;
                    }

                    body:not(.is-touch-device) .bbgl-ach-consistency-row:hover {
                        background: transparent;
                    }

                    .bbgl-ach-consistency-row .bbgl-ach-consistency-text {
                        grid-column: 1 / -1;
                        justify-self: end;
                        text-align: right;
                        padding: 1px 6px;
                        border-radius: 4px;
                        transition: background-color .12s;
                        font-family: var(--bbgl-ach-font);
                        font-size: var(--bbgl-ach-fs-row);
                        color: #bbb;
                        font-weight: 500;
                        letter-spacing: .02em;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    body:not(.is-touch-device) .bbgl-ach-consistency-row .bbgl-ach-consistency-text:hover {
                        background: rgba(255, 255, 255, .06);
                    }

                    .bbgl-ach-consistency-row .ach-cons-val {
                        color: #eaeaea;
                        font-family: var(--bbgl-ach-val-font);
                        font-variant-numeric: tabular-nums;
                        font-weight: 600;
                    }

                    .bbgl-ach-consistency-row .ach-cons-days {
                        color: #888;
                        font-family: var(--bbgl-ach-val-font);
                        font-variant-numeric: tabular-nums;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-ach-section-page0 .ach-k {
                        white-space: normal;
                        overflow: visible;
                        text-overflow: clip;
                        line-height: 1.2;
                    }

                    .ach-streak-daterange {
                        color: inherit;
                    }

                    .ach-title-long {
                        display: none;
                    }

                    .ach-title-short {
                        display: inline;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .ach-title-short {
                        display: none;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .ach-title-long {
                        display: inline;
                    }

                    .ach-cons-days {
                        display: none;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .ach-cons-days {
                        display: inline;
                    }

                    .bbgl-ach-section-hh {
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .bbgl-ach-section-hh .bbgl-ach-row {
                        padding: var(--bbgl-ach-row-pad-v, 4px) 2px;
                        border-bottom: 1px solid rgba(255, 255, 255, .05);
                        font-size: var(--bbgl-ach-fs-row) !important;
                    }

                    .bbgl-ach-hh-best-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 8px;
                        width: 100%;
                        box-sizing: border-box;
                        padding: var(--bbgl-ach-row-pad-v, 4px) 2px;
                        border-bottom: 1px solid rgba(255, 255, 255, .05);
                        font-family: var(--bbgl-ach-font);
                        font-size: var(--bbgl-ach-fs-row);
                        color: #ccc;
                        line-height: 1.4;
                    }

                    .bbgl-ach-hh-group .bbgl-ach-row:last-of-type,
                    .bbgl-ach-hh-best-row:last-of-type {
                        border-bottom: none;
                    }

                    body:not(.is-touch-device) .bbgl-ach-hh-best-row:hover {
                        background: rgba(255, 255, 255, .04);
                    }

                    .bbgl-ach-hh-group {
                        cursor: pointer;
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        border-bottom: 1px solid rgba(255, 255, 255, .05);
                    }

                    .bbgl-ach-hh-group:last-of-type {
                        border-bottom: none;
                    }

                    body:not(.is-touch-device) .bbgl-ach-hh-group:hover {
                        background: rgba(255, 255, 255, .04);
                    }

                    .bbgl-ach-hh-group .bbgl-ach-row,
                    .bbgl-ach-hh-group .bbgl-ach-hh-best-row {
                        background: transparent;
                        cursor: inherit;
                    }

                    .bbgl-ach-hh-group .bbgl-ach-hh-best-row {
                        border-bottom: none;
                    }

                    .bbgl-ach-hh-label {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        gap: clamp(6px, calc(6px + 4px * var(--bbgl-dock-t, 0)), 10px);
                        min-width: 0;
                        flex: 1;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-ach-hh-label {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0;
                    }

                    .bbgl-ach-hh-label .ach-k {
                        font-weight: 500;
                        color: #bbb;
                    }

                    .bbgl-ach-hh-label .ach-date {
                        font-family: var(--bbgl-ach-val-font);
                        color: #888;
                        line-height: 1.2;
                        margin-top: 1px;
                        font-variant-numeric: tabular-nums;
                    }

                    /* kept for compat */
                    .bbgl-ach-hh-cells {
                        display: flex;
                        gap: clamp(8px, calc(8px + 6px * var(--bbgl-dock-t, 0)), 14px);
                        align-items: center;
                        flex-shrink: 0;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-ach-hh-cells {
                        align-items: flex-end;
                    }

                    .bbgl-ach-hh-cell {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        min-width: 32px;
                    }

                    .bbgl-ach-hh-val {
                        font-family: var(--bbgl-ach-val-font);
                        font-variant-numeric: tabular-nums;
                        color: #eaeaea;
                        font-weight: 500;
                        font-size: var(--bbgl-ach-fs-row);
                        white-space: nowrap;
                        line-height: 1.15;
                    }

                    .bbgl-ach-hh-tag {
                        font-family: var(--bbgl-ach-font);
                        font-size: var(--bbgl-ach-fs-tag);
                        font-weight: 700;
                        letter-spacing: .04em;
                        text-transform: uppercase;
                        line-height: 1.2;
                        margin-top: 1px;
                    }

                    .bbgl-ach-hh-date-line {
                        font-family: var(--bbgl-ach-val-font);
                        color: #888;
                        line-height: 1.2;
                        font-variant-numeric: tabular-nums;
                        font-size: var(--bbgl-ach-fs-time);
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-ach-hh-date-line {
                        margin-top: 1px;
                    }

                    .bbgl-ach-hh-cell-total {
                        flex-direction: row;
                        align-items: baseline;
                        gap: 4px;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-ach-hh-cell-total {
                        flex-direction: column;
                        align-items: center;
                        gap: 0;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-ach-hh-cell-total .bbgl-ach-hh-tag {
                        order: 1;
                    }

                    .bbgl-ach-hh-time {
                        display: none;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-ach-hh-time {
                        display: inline;
                    }

                    .bbgl-ach-hh-cell-stat {
                        display: none;
                    }

                    #bbgl-panel:is(.bbgl-expanded, .bbgl-mode-page) .bbgl-ach-hh-cell-stat {
                        display: flex;
                    }

                    .bbgl-ach-copied-flash {
                        position: absolute;
                        inset: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #69f0ae;
                        font-weight: 600;
                        font-family: var(--bbgl-ach-val-font);
                        letter-spacing: .04em;
                        pointer-events: none;
                        z-index: 5;
                    }
                         /*==========================*/                                                    /*==========================*/
                  /*========================================*/                                      /*========================================*/
              /*================================================*/                             /*================================================*/
           /*======================================================*/                       /*======================================================*/
        /*============================================================*/                 /*============================================================*/
      /*================================================================*/             /*================================================================*/
    /*====================================================================*/         /*====================================================================*/
   /*======================================================================*/       /*======================================================================*/
  /*========================================================================*/     /*========================================================================*/
 /*==========================================================================*/   /*==========================================================================*/
/*============================================================================*/ /*============================================================================*/
/*============================================================================*/ /*============================================================================*/
/*============================================================================*/ /*============================================================================*/
/*============================================================================*/ /*============================================================================*/
/*============================================================================*/ /*============================================================================*/
 /*==========================================================================*/   /*==========================================================================*/
  /*========================================================================*/     /*========================================================================*/
   /*======================================================================*/       /*======================================================================*/
    /*====================================================================*/         /*====================================================================*/
      /*================================================================*/             /*================================================================*/
        /*============================================================*/                 /*============================================================*/
           /*======================================================*/                       /*======================================================*/
              /*================================================*/                             /*================================================*/
                  /*========================================*/                                     /*========================================*/
                         /*==========================*/                                                   /*==========================*/                         
`;

    function injectStyles() {
        if (document.getElementById('bbgl-styles')) return;
        const root = document.head || document.documentElement;
        if (!document.getElementById('bbgl-fonts')) {
            const pre = document.createElement('link');
            pre.id = 'bbgl-fonts-pre';
            pre.rel = 'preconnect';
            pre.href = 'https://fonts.gstatic.com';
            pre.crossOrigin = 'anonymous';
            root.appendChild(pre);
            const link = document.createElement('link');
            link.id = 'bbgl-fonts';
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Aldrich&family=Barlow+Condensed:wght@400;500;700&family=Dancing+Script:wght@700&family=Fjalla+One&family=Inconsolata:wght@400;500;600;700&family=Neonderthaw&family=Patrick+Hand&family=Roboto+Mono:wght@400;500;700&family=VT323&display=swap';
            root.appendChild(link);
        }
        const style = document.createElement('style');
        style.id = 'bbgl-styles';
        style.textContent = CSS_STYLES;
        root.appendChild(style);
    }

    function cacheDOM(root) {
        if (!root) return;
        dom.panel = root.id === 'bbgl-panel' ? root : root.querySelector('#bbgl-panel') || root;
        if (!userConfig.animations) dom.panel.classList.add('bbgl-no-animations');
        if (!userConfig.ratesEnabled) dom.panel.classList.add('bbgl-no-rates');
        dom.topPanel = root.querySelector('#bbgl-top-panel');
        dom.bottomPanel = root.querySelector('#bbgl-bottom-panel');
        dom.settingsView = root.querySelector('#bbgl-settings-view');
        dom.welcomeView = root.querySelector('#bbgl-welcome-view');
        dom.itemViewer = root.querySelector('#bbgl-item-viewer');
        dom.dateLabel = root.querySelector('#bbgl-date-label');
        dom.summaryLabel = root.querySelector('#bbgl-summary-label');
        dom.ledgerFooter = root.querySelector('#bbgl-ledger-footer');
        if (!dom.ledgerFooter && dom.dateLabel && dom.summaryLabel) {
            dom.ledgerFooter = document.createElement('div');
            dom.ledgerFooter.id = 'bbgl-ledger-footer';
            dom.dateLabel.before(dom.ledgerFooter);
            dom.ledgerFooter.append(dom.dateLabel, dom.summaryLabel);
        }
        dom.ledgerView = root.querySelector('#bbgl-ledger-view');
        dom.graphContainer = root.querySelector('#bbgl-graph-container');
        dom.graphSvg = root.querySelector('#bbgl-graph-svg');
        dom.calContainer = root.querySelector('#bbgl-cal-container');
        dom.copyBtn = root.querySelector('#bbgl-copy-btn');
        dom.itemCounters = root.querySelector('#bbgl-item-counters');
        dom.popBtn = root.querySelector('#bbgl-pop-btn');
        dom.monthTrigger = root.querySelector('#month-trigger');
        dom.yearTrigger = root.querySelector('#year-trigger');
        dom.monthDropdown = root.querySelector('#bbgl-month-dropdown');
        dom.yearDropdown = root.querySelector('#bbgl-year-dropdown');
        dom.achievementsContainer = root.querySelector('#bbgl-achievements-container');
        dom.libraryContainer = root.querySelector('#bbgl-library-container');
        dom.achievementsToggle = root.querySelector('#bbgl-achievements-toggle');
        dom.stickerGrid = root.querySelector('#bbgl-sticker-grid');
        dom.stickerPagination = root.querySelector('#bbgl-sticker-pagination');
        dom.stickerPaginationBar = root.querySelector('#bbgl-sticker-pagination-bar');
        dom.stickerTitle = root.querySelector('#bbgl-sticker-title');
        dom.stickerPrev = root.querySelector('#sticker-prev-btn');
        dom.stickerNext = root.querySelector('#sticker-next-btn');
        dom.stickerContainer = root.querySelector('#bbgl-sticker-container');
        dom.stickerBg = root.querySelector('#bbgl-sticker-bg');
        dom.viPedestal = root.querySelector('#vi-pedestal-wrapper');
        dom.viObj = root.querySelector('#vi-obj-target');
        dom.viName = root.querySelector('#vi-name-target');
        dom.refreshBtn = root.querySelector('#refresh-log-btn');
        dom.contentWrapper = root.querySelector('#bbgl-content-wrapper');
        if (!dom.gymTab) dom.gymTab = document.getElementById('bbgl-gym-tab');
    }
