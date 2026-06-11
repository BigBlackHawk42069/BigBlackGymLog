    /**
     *  [SECTION III] THE PHYSIQUE (Assets & Styles)
     *  ========================================================================
     *  The Big & Black Part of the script.
     */
    const ASSETS = {
        HEADER_IMG: "https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/cal-hdr.jpg",
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
        CHART: `<svg viewBox="0 0 24 24"><path d="M7 19h2v-8H7v8zm4 0h2V5h-2v14zm4 0h2v-6h-2v6z"/></svg>`,
        LEDGER: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="18" height="20" rx="2" fill="none"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="17" y2="16"/></svg>`,
        GRAPH: `<svg viewBox="0 0 24 24"><path d="M3,12 L7,16 L13,6 L18,14 L22,8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        STICKERBOOK: `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.5" fill="none"/><circle cx="12" cy="5.5" r="3.5" fill="none"/><circle cx="18" cy="10" r="3.5" fill="none"/><circle cx="16" cy="17" r="3.5" fill="none"/><circle cx="8" cy="17" r="3.5" fill="none"/><circle cx="6" cy="10" r="3.5" fill="none"/></svg>`,
        ACHIEVEMENTS: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" fill="none"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" fill="none"></path><path d="M4 22h16" fill="none"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" fill="none"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" fill="none"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" fill="none"></path></svg>`,
        PASTE: `<svg viewBox="0 0 24 24"><path d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2Z"/></svg>`,
        CHECK: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17 4 12" fill="none"/></svg>`,
        CLOSE: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
    };
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
                    }

                    .bbgl-prefs-tab-title:first-child {
                        margin-top: 0;
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

                    .bbgl-btn-green {
                        background-image: linear-gradient(#0e1806 0%, #3e5e22 25%, #2b4216 60%, #2b4216 78%, #0e1806 100%) !important;
                        border-color: #0e1806 !important;
                    }

                    .bbgl-btn-green:hover {
                        background-image: linear-gradient(#1a2e0b 0%, #4f782b 25%, #3a591e 60%, #3a591e 78%, #1a2e0b 100%) !important;
                    }

                    .bbgl-btn-green:active {
                        background-image: linear-gradient(#080f03 0%, #2b4216 100%) !important;
                        border-color: #555 !important;
                    }

                    .bbgl-btn-red {
                        background-image: linear-gradient(#200505 0%, #701a1a 25%, #4f0e0e 60%, #4f0e0e 78%, #200505 100%) !important;
                        border-color: #200505 !important;
                    }

                    .bbgl-btn-red:hover {
                        background-image: linear-gradient(#360808 0%, #942222 25%, #6e1313 60%, #6e1313 78%, #360808 100%) !important;
                    }

                    .bbgl-btn-red:active {
                        background-image: linear-gradient(#140303 0%, #4f0e0e 100%) !important;
                        border-color: #555 !important;
                    }

                    .bbgl-btn-purple {
                        background-image: linear-gradient(#1a0529 0%, #6a1b9a 25%, #4a1070 60%, #4a1070 78%, #1a0529 100%) !important;
                        border-color: #1a0529 !important;
                    }

                    .bbgl-btn-purple:hover {
                        background-image: linear-gradient(#2a0840 0%, #8e24aa 25%, #6a1b9a 60%, #6a1b9a 78%, #2a0840 100%) !important;
                    }

                    .bbgl-btn-purple:active {
                        background-image: linear-gradient(#0f0318 0%, #4a1070 100%) !important;
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

                    .bbgl-switch-purple input:checked + .slider {
                        background-color: #6a1b9a;
                        /**/
                        box-shadow: 0 0 5px rgba(106, 27, 154, .6);
                    }

                    #bbgl-settings-view .bbgl-switch input:checked + .slider {
                        background-color: #6a1b9a;
                        /**/
                        box-shadow: 0 0 5px rgba(106, 27, 154, .6);
                    }

                    .bbgl-bestgym {
                        float: right;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        height: 24px;
                        line-height: 24px;
                        color: #999;
                        margin-right: 8px;
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

                    .bbgl-settings-body .bbgl-api-grid {
                        display: flex !important;
                        flex-direction: row !important;
                        gap: 0 !important;
                        margin: 0 10px 10px !important;
                        width: auto !important;
                    }

                    .bbgl-api-grid .bbgl-btn {
                        flex: 1 1 0 !important;
                        margin: 0 !important;
                        width: 50% !important;
                    }

                    .bbgl-api-grid .bbgl-btn:first-child {
                        border-top-right-radius: 0 !important;
                        border-bottom-right-radius: 0 !important;
                        border-top-left-radius: 5px !important;
                        border-bottom-left-radius: 5px !important;
                        border-right: none !important;
                    }

                    .bbgl-api-grid .bbgl-btn:last-child {
                        border-top-left-radius: 0 !important;
                        border-bottom-left-radius: 0 !important;
                        border-top-right-radius: 5px !important;
                        border-bottom-right-radius: 5px !important;
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

                    .bbgl-settings-body #updt-settings-btn {
                        margin: 0 10px 10px;
                        width: calc(100% - 20px);
                        display: block;
                    }

                    .bbgl-settings-body .bbgl-btn-grid {
                        margin: 8px 10px 0;
                    }

                    [class*="area-desktop___"][class*="active___"] [class*="defaultIcon___"] svg,
                    [class*="area-mobile___"][class*="active___"] [class*="defaultIcon___"] svg {
                        fill: #fff;
                        stroke: #fff;
                        filter: drop-shadow(0 0 4px rgba(255, 255, 255, .55));
                    }

                    .bbgl-sb-notif [class*="desktopLink___"] {
                        background: linear-gradient(to right, rgba(171, 71, 188, .28), rgba(171, 71, 188, .12)) !important;
                    }

                    .bbgl-sb-notif [class*="defaultIcon___"] svg {
                        fill: #d896e0 !important;
                        stroke: #d896e0 !important;
                        /**/
                        filter: drop-shadow(0 0 3px rgba(216, 150, 224, .6)) brightness(1.15) !important;
                    }

                    .bbgl-sb-notif [class*="mobileLink___"] > span:not([class]) {
                        color: #d896e0 !important;
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
                        /**/
                        padding: 8px 0;
                        box-sizing: border-box;
                        container-type: inline-size;
                        container-name: bbgl-page;
                    }

                    .bbgl-native-header {
                        /**/
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
                        /**/
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
                        /**/
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
                        /**/
                        --bbgl-f-top: 10px;
                        --bbgl-f-bot: 9px;
                        --bbgl-f-top-mb: 1px;
                        --bbgl-bot-minh: 12px;
                        --bbgl-col-gap: 8px;
                        --bbgl-gx: clamp(7px, 1.78cqi, 12px);
                        --bbgl-label-case: uppercase;
                        --bbgl-viewer-title-top-shift: 3px;
                        container-type: inline-size;
                        container-name: bbgl-panel;
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
                        transition: width .3s cubic-bezier(.25, 1, .5, 1), height .3s cubic-bezier(.25, 1, .5, 1);
                    }

                    #bbgl-panel.bbgl-expanded {
                        --bbgl-f-label: clamp(12.5px, 2.34cqi, 13.5px);
                        --bbgl-f-top: clamp(12.5px, 2.34cqi, 13.5px);
                        --bbgl-f-bot: clamp(10.5px, 1.997cqi, 11.5px);
                        --bbgl-f-top-mb: 3px;
                        --bbgl-bot-minh: 14px;
                        --bbgl-col-gap: clamp(8px, 2.78cqi, 16px);
                        --bbgl-label-case: none;
                        width: min(576px, calc(100vw - 20px));
                        height: 633px;
                        /**/
                        max-height: calc(100vh - 50px) !important;
                        overflow-y: auto;
                        overflow-x: hidden;
                    }

                    #bbgl-panel.bbgl-tall {
                        --bbgl-f-label: 12px;
                        --bbgl-f-top: 12px;
                        --bbgl-f-bot: 11px;
                        --bbgl-col-gap: 13px;
                    }

                    #bbgl-panel.bbgl-tall.bbgl-expanded {
                        --bbgl-f-label: clamp(13.75px, calc(2px + 2.34cqi), 15.5px);
                        --bbgl-f-top: clamp(13.75px, calc(2px + 2.34cqi), 15.5px);
                        --bbgl-f-bot: clamp(11.75px, calc(1.5px + 1.997cqi), 13px);
                        --bbgl-col-gap: clamp(22px, calc(35.5px - 2.34cqi), 24.5px);
                    }

                    #bbgl-panel.bbgl-mode-page {
                        position: relative !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: auto !important;
                        bottom: auto !important;
                        width: 100% !important;
                        flex: none !important;
                        max-width: none !important;
                        height: auto !important;
                        max-height: none !important;
                        border: 1px solid #444 !important;
                        border-radius: 5px !important;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, .5) !important;
                        box-sizing: border-box !important;
                        background: #2a2a2a !important;
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 0 !important;
                        z-index: 1 !important;
                        overflow-x: hidden !important;
                        overflow-y: visible !important;
                    }

                    #bbgl-panel.bbgl-mode-page {
                        --bbgl-label-case: none !important;
                        --bbgl-page-t: clamp(0, calc((100cqi - 350px) / 370px), 1);
                        --bbgl-f-label: clamp(10.75px, calc(10.75px + 5.25px * var(--bbgl-page-t)), 16px);
                        --bbgl-f-top: clamp(10.75px, calc(10.75px + 6.25px * var(--bbgl-page-t)), 17px);
                        --bbgl-f-bot: clamp(9px, calc(9px + 5px * var(--bbgl-page-t)), 14px);
                        --bbgl-f-top-mb: clamp(2px, calc(2px + 2px * var(--bbgl-page-t)), 4px);
                        --bbgl-bot-minh: clamp(12px, calc(12px + 4px * var(--bbgl-page-t)), 16px);
                        --bbgl-col-gap: clamp(6px, calc(6px + 20px * var(--bbgl-page-t)), 26px);
                    }

                    .bbgl-mode-page .bbgl-header {
                        display: none !important;
                    }

                    .bbgl-mode-page #bbgl-content-wrapper {
                        display: contents !important;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-top-panel {
                        flex: 0 0 clamp(180px, calc(180px + 90px * var(--bbgl-page-t)), 270px) !important;
                        height: clamp(180px, calc(180px + 90px * var(--bbgl-page-t)), 270px) !important;
                        width: 100%;
                        margin-bottom: 0 !important;
                        /**/
                        border: none !important;
                        border-bottom: 1px solid #444 !important;
                        border-radius: 0 !important;
                        display: flex;
                        flex-direction: column;
                        padding-top: clamp(2px, calc(2px + 18px * var(--bbgl-page-t)), 20px) !important;
                        overflow: hidden !important;
                        box-shadow: inset 0 0 40px rgba(0, 0, 0, .95) !important;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-header-wrapper {
                        flex: 0 0 clamp(108px, calc(108px + 89px * var(--bbgl-page-t)), 197px);
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-header-wrapper::before {
                        left: 4px;
                        right: 4px;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-month-header {
                        padding-left: clamp(4px, calc(4px + 3px * var(--bbgl-page-t)), 7px);
                        padding-right: clamp(16px, calc(16px + 16px * var(--bbgl-page-t)), 32px);
                        gap: clamp(8px, calc(8px + 8px * var(--bbgl-page-t)), 16px);
                        padding-bottom: 6px;
                    }

                    @container bbgl-panel (max-width:499px) {
                        #bbgl-panel.bbgl-mode-page {
                            --bbgl-label-case: none !important;
                        }
                    }

                    .bbgl-mode-page #bbgl-bottom-panel {
                        flex: none !important;
                        width: 100%;
                        border: none !important;
                        border-radius: 0 !important;
                        background: 0 0 !important;
                        min-height: 0;
                        display: flex;
                        flex-direction: column;
                        height: auto !important;
                        overflow: visible !important;
                    }

                    .bbgl-mode-page #bbgl-settings-view {
                        flex: none;
                        height: auto !important;
                    }

                    .bbgl-mode-page .bbgl-settings-scroll-area {
                        overflow-y: visible !important;
                        height: auto !important;
                        flex: none;
                    }

                    .bbgl-mode-page:has(#bbgl-settings-view.active-view) {
                        flex: none !important;
                    }

                    .bbgl-mode-page:has(#bbgl-settings-view.active-view) #bbgl-bottom-panel {
                        flex: none !important;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-grid-container {
                        height: auto !important;
                        flex: none !important;
                        padding: 0 clamp(2px, calc(2px + 2px * var(--bbgl-page-t)), 4px) clamp(1px, calc(1px + 3px * var(--bbgl-page-t)), 4px) clamp(2px, calc(2px + 2px * var(--bbgl-page-t)), 4px) !important;
                        overflow: visible !important;
                    }

                    .bbgl-mode-page .calendar-wrapper {
                        height: auto !important;
                        flex: none !important;
                        overflow: hidden !important;
                    }

                    .bbgl-mode-page .bbgl-cal-container {
                        height: auto !important;
                        display: flex;
                        flex-direction: column;
                    }

                    .bbgl-mode-page .bbgl-row-slice {
                        flex: none !important;
                        width: 100%;
                    }

                    .bbgl-mode-page .bbgl-day-cell {
                        aspect-ratio: 1/1 !important;
                        height: auto !important;
                        width: 100% !important;
                    }

                    #bbgl-panel.bbgl-mode-page .ledger-content:not(#bbgl-achievements-container) {
                        height: auto !important;
                        overflow: visible !important;
                        align-content: flex-start !important;
                        grid-template-rows: 1fr !important;
                        padding-top: clamp(26px, calc(32px - 6px * var(--bbgl-page-t)), 32px) !important;
                        padding-bottom: clamp(0px, calc(0px + 15px * var(--bbgl-page-t)), 15px) !important;
                        padding-left: 4px !important;
                        padding-right: 4px !important;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-achievements-container {
                        --bbgl-ach-inset-x: clamp(6px, calc(6px + 4px * var(--bbgl-page-t)), 24px);
                        --bbgl-ach-container-pt: 0;
                        --bbgl-ach-scroll-pt: clamp(2px, calc(4px - 1px * var(--bbgl-page-t)), 5px);
                        --bbgl-ach-footer-pt: clamp(0px, calc(1px + 1px * var(--bbgl-page-t)), 2px);
                        --bbgl-ach-footer-pb: 0;
                        --bbgl-ach-footer-gap: clamp(4px, calc(4px + 2px * var(--bbgl-page-t)), 6px);
                        --bbgl-ach-dot-gap: clamp(4px, calc(4px + 2px * var(--bbgl-page-t)), 6px);
                        --bbgl-ach-dot-w: clamp(5px, calc(5px + 1px * var(--bbgl-page-t)), 6px);
                        --bbgl-ach-nav-fs: clamp(7px, calc(1.45 * var(--bbgl-ach-dot-w)), 11px);
                        --bbgl-ach-nav-py: 0;
                        --bbgl-ach-nav-px: clamp(2px, calc(2px + 3px * var(--bbgl-page-t)), 8px);
                        --bbgl-ach-scroll-pb: clamp(0px, calc(2px - .5px * var(--bbgl-page-t)), 2px);
                        padding-top: var(--bbgl-ach-container-pt) !important;
                        padding-left: var(--bbgl-ach-inset-x) !important;
                        padding-right: var(--bbgl-ach-inset-x) !important;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-ach-scroll {
                        padding-top: clamp(18px, calc(18px + 6px * var(--bbgl-page-t)), 24px) !important;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-ach-pageindicator .pg-dot {
                        width: var(--bbgl-ach-dot-w);
                        height: var(--bbgl-ach-dot-w);
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-ach-section-title {
                        font-size: clamp(9.5px, calc(9.5px + 4.5px * var(--bbgl-page-t)), 14px) !important;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-ach-row {
                        font-size: clamp(9px, calc(9px + 4px * var(--bbgl-page-t)), 13px) !important;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-group .bbgl-ach-row,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-group .bbgl-ach-hh-best-row {
                        font-size: clamp(9px, calc(9px + 4px * var(--bbgl-page-t)), 13px) !important;
                    }

                    #bbgl-panel.bbgl-mode-page .ach-sub {
                        font-size: clamp(7px, calc(7px + 3px * var(--bbgl-page-t)), 10px) !important;
                    }

                    /**/
                    #bbgl-panel.bbgl-mode-page .ach-date {
                        font-size: clamp(7.5px, calc(7.5px + 3.5px * var(--bbgl-page-t)), 11px) !important;
                    }

                    #bbgl-panel.bbgl-mode-page .col-header,
                    #bbgl-panel.bbgl-mode-page .col-data-block {
                        margin-bottom: calc(8px * (1 - var(--bbgl-page-t)));
                    }

                    #bbgl-panel.bbgl-mode-page .day-num {
                        top: clamp(2px, calc(2px + 4px * var(--bbgl-page-t)), 6px);
                        left: clamp(2px, calc(2px + 4px * var(--bbgl-page-t)), 6px);
                        font-size: clamp(10px, calc(10px + 8px * var(--bbgl-page-t)), 18px);
                        width: clamp(22px, calc(22px + 14px * var(--bbgl-page-t)), 36px);
                        height: clamp(22px, calc(22px + 14px * var(--bbgl-page-t)), 36px);
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-day-cell.is-viewing .day-num {
                        font-size: clamp(14px, calc(14px + 10px * var(--bbgl-page-t)), 24px) !important;
                        width: clamp(26px, calc(26px + 14px * var(--bbgl-page-t)), 40px);
                        height: clamp(26px, calc(26px + 14px * var(--bbgl-page-t)), 40px);
                    }

                    #bbgl-panel.bbgl-mode-page .ui-floating-label,
                    #bbgl-panel.bbgl-mode-page .ui-floating-summary {
                        font-size: clamp(11px, calc(11px + 4px * var(--bbgl-page-t)), 15px);
                        bottom: clamp(4px, calc(4px + 2px * var(--bbgl-page-t)), 6px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-graph-container {
                        padding-top: clamp(12px, calc(19px - 7px * var(--bbgl-page-t)), 19px);
                        padding-bottom: clamp(2px, calc(2px + 2px * var(--bbgl-page-t)), 5px);
                        padding-left: clamp(4px, calc(4px + 5px * var(--bbgl-page-t)), 10px);
                        padding-right: clamp(4px, calc(4px + 5px * var(--bbgl-page-t)), 10px);
                    }

                    @container bbgl-panel (max-width:499px) {

                        #bbgl-panel.bbgl-mode-page .bbgl-header-wrapper,
                        #bbgl-panel.bbgl-mode-page #bbgl-graph-container,
                        #bbgl-panel.bbgl-mode-page #bbgl-cal-container {
                            will-change: transform;
                        }
                    }

                    .bbgl-mode-page #bbgl-close-btn,
                    .bbgl-mode-page #bbgl-pop-btn,
                    .bbgl-mode-page #bbgl-tall-toggle {
                        display: none !important;
                    }

                    .bbgl-mode-page #bbgl-ledger-toggle,
                    .bbgl-mode-page #bbgl-graph-toggle,
                    .bbgl-mode-page #bbgl-achievements-toggle,
                    .bbgl-mode-page #bbgl-sticker-toggle,
                    .bbgl-mode-page #bbgl-copy-btn {
                        opacity: 1 !important;
                        pointer-events: auto !important;
                    }

                    .bbgl-mode-page #bbgl-ledger-toggle {
                        left: 10px !important;
                    }

                    .bbgl-mode-page #bbgl-graph-toggle {
                        left: clamp(34px, calc(34px + 6px * var(--bbgl-page-t)), 40px) !important;
                    }

                    .bbgl-mode-page #bbgl-achievements-toggle {
                        left: clamp(58px, calc(58px + 12px * var(--bbgl-page-t)), 70px) !important;
                    }

                    .bbgl-mode-page #bbgl-sticker-toggle {
                        left: clamp(82px, calc(82px + 18px * var(--bbgl-page-t)), 100px) !important;
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

                    /**/
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
                        text-transform: Title Case;
                        padding: 0 8px;
                        border-bottom: 1px solid #000;
                        border-radius: 5px 5px 0 0;
                        /**/
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
                        display: none;
                        white-space: normal;
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

                    #bbgl-api-hud {
                        position: fixed;
                        top: 10px;
                        left: 10px;
                        z-index: 999999;
                        background: rgba(0, 0, 0, .8);
                        color: #76ff03;
                        padding: 5px 10px;
                        border-radius: 4px;
                        font-family: 'Consolas', monospace;
                        font-size: 12px;
                        border: 1px solid #333;
                        pointer-events: none;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, .5);
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
                        flex-shrink: 0 !important;
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
                        flex: 0 0 30%;
                        box-sizing: border-box;
                        /**/
                        background-color: #2b2b2b;
                        box-shadow: inset 0 0 40px rgba(0, 0, 0, .95);
                        border-bottom: 1px solid #111;
                        position: relative;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                        padding-top: 2px;
                        padding-bottom: 8px;
                        transition: flex-basis .3s, margin-bottom .3s, padding-top .3s;
                        z-index: 25;
                    }

                    .bbgl-tall #bbgl-top-panel {
                        flex: 0 0 40%;
                        margin-bottom: -13.41%;
                        z-index: 25;
                        box-shadow: 0 5px 15px rgba(0, 0, 0, .5), inset 0 0 40px rgba(0, 0, 0, .95);
                        border-bottom: 1px solid #333;
                        padding-top: 18px;
                    }

                    #bbgl-panel.bbgl-tall:not(.bbgl-expanded):not(.bbgl-mode-page) .ledger-content {
                        padding-top: 8px !important;
                    }

                    .bbgl-expanded #bbgl-top-panel {
                        flex: 0 0 28%;
                    }

                    .bbgl-expanded.bbgl-tall #bbgl-top-panel {
                        flex: 0 0 38%;
                        margin-bottom: -10.35%;
                        padding-top: 20px;
                    }

                    #bbgl-tall-toggle,
                    #bbgl-ledger-toggle,
                    #bbgl-graph-toggle,
                    #bbgl-achievements-toggle,
                    #bbgl-sticker-toggle,
                    #bbgl-copy-btn {
                        position: absolute;
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

                    #bbgl-tall-toggle:hover,
                    #bbgl-ledger-toggle:hover,
                    #bbgl-graph-toggle:hover,
                    #bbgl-achievements-toggle:hover,
                    #bbgl-sticker-toggle:hover,
                    #bbgl-copy-btn:hover {
                        color: rgba(255, 255, 255, 1);
                    }

                    #bbgl-tall-toggle {
                        top: 3px;
                        left: 3px;
                        font-size: 15px;
                        font-weight: 700;
                        width: 19px;
                        height: 19px;
                    }

                    #bbgl-ledger-toggle,
                    #bbgl-graph-toggle,
                    #bbgl-achievements-toggle,
                    #bbgl-sticker-toggle,
                    #bbgl-copy-btn {
                        top: 5.5px;
                        width: 14px;
                        height: 14px;
                        z-index: 59;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity .3s cubic-bezier(.25, .8, .25, 1), color .15s, filter .15s, transform .15s;
                    }

                    #bbgl-ledger-toggle svg,
                    #bbgl-graph-toggle svg,
                    #bbgl-achievements-toggle svg,
                    #bbgl-sticker-toggle svg,
                    #bbgl-copy-btn svg {
                        width: 14px;
                        height: 14px;
                        fill: currentColor;
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
                    .viewing-stickers #bbgl-sticker-toggle {
                        color: #fff !important;
                        filter: drop-shadow(0 0 5px rgba(255, 255, 255, .7));
                        transform: scale(1.15);
                    }

                    #bbgl-top-panel:not(.viewing-graph):not(.viewing-stickers):not(.viewing-achievements) #bbgl-ledger-toggle {
                        color: #fff !important;
                        filter: drop-shadow(0 0 5px rgba(255, 255, 255, .7));
                        transform: scale(1.15);
                    }

                    .bbgl-tall #bbgl-ledger-toggle {
                        left: 32px;
                        opacity: 1;
                        pointer-events: auto;
                    }

                    .bbgl-tall #bbgl-graph-toggle {
                        left: 57px;
                        opacity: 1;
                        pointer-events: auto;
                    }

                    .bbgl-tall #bbgl-achievements-toggle {
                        left: 82px;
                        opacity: 1;
                        pointer-events: auto;
                    }

                    .bbgl-tall #bbgl-sticker-toggle {
                        left: 107px;
                        opacity: 1;
                        pointer-events: auto;
                    }

                    .bbgl-tall #bbgl-copy-btn {
                        right: 8px;
                        opacity: 1;
                        pointer-events: auto;
                        transform: scale(1.15);
                    }

                    .bbgl-expanded #bbgl-tall-toggle {
                        top: 3px;
                        left: 3px;
                        font-size: 15px;
                        width: 19px;
                        height: 19px;
                    }

                    .bbgl-expanded.bbgl-tall #bbgl-ledger-toggle {
                        width: 15.5px;
                        height: 15.5px;
                        left: 32px;
                    }

                    .bbgl-expanded.bbgl-tall #bbgl-graph-toggle {
                        width: 16px;
                        height: 16px;
                        left: clamp(56px, calc(51.6px + 1.45cqi), 60px);
                    }

                    .bbgl-expanded.bbgl-tall #bbgl-achievements-toggle {
                        width: 15.5px;
                        height: 15.5px;
                        left: clamp(80px, calc(71.2px + 2.9cqi), 88px);
                    }

                    .bbgl-expanded.bbgl-tall #bbgl-sticker-toggle {
                        width: 16px;
                        height: 16px;
                        left: clamp(104px, calc(90.8px + 4.35cqi), 116px);
                    }

                    .bbgl-expanded.bbgl-tall #bbgl-copy-btn {
                        width: 15.5px;
                        height: 15.5px;
                        right: 10px;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-ledger-toggle,
                    #bbgl-panel.bbgl-mode-page #bbgl-graph-toggle,
                    #bbgl-panel.bbgl-mode-page #bbgl-achievements-toggle,
                    #bbgl-panel.bbgl-mode-page #bbgl-sticker-toggle,
                    #bbgl-panel.bbgl-mode-page #bbgl-copy-btn {
                        width: clamp(14.5px, calc(14.5px + 3.5px * var(--bbgl-page-t)), 18px);
                        height: clamp(14.5px, calc(14.5px + 3.5px * var(--bbgl-page-t)), 18px);
                        top: clamp(4.5px, calc(4.5px + 5.5px * var(--bbgl-page-t)), 10px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-ledger-toggle {
                        left: 32px;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-graph-toggle {
                        left: 62px;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-achievements-toggle {
                        left: 92px;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-sticker-toggle {
                        left: 122px;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-copy-btn {
                        right: 12px;
                    }

                    .bbgl-expanded #bbgl-ledger-toggle svg,
                    .bbgl-expanded #bbgl-graph-toggle svg,
                    .bbgl-expanded #bbgl-achievements-toggle svg,
                    .bbgl-expanded #bbgl-sticker-toggle svg,
                    .bbgl-expanded #bbgl-copy-btn svg,
                    .bbgl-mode-page #bbgl-ledger-toggle svg,
                    .bbgl-mode-page #bbgl-graph-toggle svg,
                    .bbgl-mode-page #bbgl-achievements-toggle svg,
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
                        background-image: url('https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/glass-ovly.jpg');
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
                        transition: font-size .3s;
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
                        font-size: 12px !important;
                    }

                    .viewing-graph .ui-floating-label,
                    .viewing-graph .ui-floating-summary,
                    .viewing-achievements .ui-floating-label,
                    .viewing-achievements .ui-floating-summary {
                        opacity: 0;
                    }

                    .viewing-stickers .ui-floating-label,
                    .viewing-stickers .ui-floating-summary {
                        display: none;
                    }

                    #bbgl-top-panel.viewing-stickers {
                        box-shadow: none !important;
                        border-bottom: none !important;
                        background-color: transparent !important;
                        padding-bottom: 2px !important;
                    }

                    #bbgl-top-panel.viewing-stickers::after,
                    #bbgl-top-panel.viewing-stickers .glass-overlay {
                        display: none !important;
                    }

                    #bbgl-top-panel.viewing-achievements {
                        border-bottom: none !important;
                    }

                    #bbgl-top-panel.viewing-achievements::after {
                        box-shadow: inset 1px 1px 1px rgba(255, 255, 255, .2) !important;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-top-panel.viewing-achievements {
                        padding-top: max(0px, calc(clamp(2px, calc(2px + 18px * var(--bbgl-dock-t, 0)), 20px) - calc(2px * var(--bbgl-dock-t, 0)))) !important;
                    }

                    .ledger-content {
                        position: relative;
                        flex: 1;
                        overflow-y: auto;
                        overflow-x: hidden;
                        padding: 4px 2px;
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 0;
                        transition: opacity .3s;
                        transform-origin: center;
                        scrollbar-width: none;
                    }

                    .viewing-graph #bbgl-ledger-view,
                    .viewing-stickers #bbgl-ledger-view,
                    .viewing-achievements #bbgl-ledger-view {
                        display: none !important;
                    }

                    .bbgl-expanded .ledger-content {
                        grid-template-columns: repeat(4, 1fr);
                        grid-template-rows: minmax(0, 1fr);
                        padding-top: 6px;
                        padding-bottom: 14px;
                    }

                    #bbgl-panel.bbgl-tall.bbgl-expanded .ledger-content {
                        padding-top: 12px;
                    }

                    .stat-column {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: flex-start;
                        height: 100%;
                        border-right: 1px solid rgba(255, 255, 255, .05);
                        padding: 0 2px;
                        min-height: 0;
                        --bbgl-f-top-mb: 0;
                        --bbgl-bot-minh: 0;
                    }

                    /**/
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
                        transition: max-height .3s, flex-basis .3s;
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

                    .rate-pct {
                        display: none !important;
                    }

                    .bbgl-mode-page .rate-pct,
                    .bbgl-expanded.bbgl-tall .rate-pct {
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
                        transition: font-size .3s;
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
                        transition: font-size .3s;
                    }

                    .c-label {
                        font-weight: 700;
                        font-family: 'Arial', sans-serif;
                        font-size: var(--bbgl-f-label);
                        text-transform: var(--bbgl-label-case);
                        letter-spacing: 0;
                        transition: font-size .3s;
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
                    #bbgl-achievements-container {
                        display: none;
                        flex: 1;
                        flex-direction: column;
                        position: relative;
                        z-index: 20;
                    }

                    .viewing-graph #bbgl-graph-container,
                    .viewing-achievements #bbgl-achievements-container {
                        display: flex;
                    }

                    .viewing-graph #bbgl-graph-container {
                        padding: 3px calc(var(--bbgl-gx, 10px) - 2px) 1px calc(var(--bbgl-gx, 10px) - 2px);
                        z-index: 40;
                        /**/
                        transform-origin: center;
                        touch-action: none;
                        cursor: crosshair;
                        min-height: 0;
                        overflow: visible;
                    }

                    .viewing-achievements #bbgl-achievements-container.ledger-content {
                        grid-template-columns: unset !important;
                        grid-template-rows: unset !important;
                        gap: 0 !important;
                        min-height: 0 !important;
                        overflow: hidden !important;
                        display: flex !important;
                        flex-direction: column !important;
                        flex: 1 !important;
                        padding: 0 !important;
                    }

                    .g-hud {
                        display: flex;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 2px;
                        z-index: 60;
                        position: relative;
                        min-width: 0;
                        width: 100%;
                        box-sizing: border-box;
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

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .g-hud {
                        margin-top: 1px;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) #bbgl-graph-container .g-pill {
                        font-size: 8px;
                        padding: 2px 5px;
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

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .g-text.x-label {
                        font-size: 10px;
                    }

                    .g-text.y-label {
                        text-anchor: end;
                        font-family: 'Barlow Condensed', 'Arial Narrow', 'Nimbus Sans Narrow', Tahoma, sans-serif;
                        font-weight: 500;
                        letter-spacing: .005em;
                    }

                    .g-point-group .g-point-visual {
                        opacity: 0;
                        transition: opacity .1s;
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
                        background-image: url('https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Stickerbook/stkr-bckgr.png');
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
                        padding: 4px;
                        z-index: 40;
                        transform-origin: center;
                        overflow: hidden;
                        justify-content: flex-start;
                    }

                    .sticker-nav-btn {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-60%);
                        width: 20px;
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
                        transition: transform .2s, text-shadow .2s;
                        user-select: none;
                        line-height: 1;
                        text-shadow: 0 1px 3px #000;
                    }

                    @media (hover: hover) {
                        .sticker-nav-btn:hover {
                            color: #fff;
                            transform: translateY(-50%) scale(1.3);
                            text-shadow: 0 0 8px rgba(255, 255, 255, .8);
                            filter: none;
                        }
                    }

                    .sticker-nav-btn:active {
                        color: #fff;
                        transform: translateY(-50%) scale(1.3);
                        text-shadow: 0 0 8px rgba(255, 255, 255, .8);
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
                        grid-template-columns: repeat(5, 1fr);
                        grid-template-rows: auto auto;
                        width: 100%;
                        flex: 1;
                        align-content: start;
                        padding-top: 0;
                        row-gap: 0;
                    }

                    .sticker-slot {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        overflow: visible;
                        padding: 0;
                        height: 64px;
                        visibility: hidden;
                    }

                    .sticker-slot.active-slot {
                        visibility: visible;
                    }

                    #bbgl-panel.bbgl-mode-page .sticker-slot {
                        height: clamp(65px, calc(65px + 40px * var(--bbgl-page-t)), 105px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-sticker-grid {
                        row-gap: clamp(10px, calc(10px + 6px * var(--bbgl-page-t)), 16px);
                        padding-top: clamp(5px, calc(5px + 9px * (1 - var(--bbgl-page-t))), 14px);
                        column-gap: clamp(1px, calc(35px - 5.3cqi - 7px * (1 - var(--bbgl-page-t))), 22px);
                    }

                    .sticker-slot.has-item:hover {
                        cursor: pointer;
                        z-index: 45;
                    }

                    .sticker-img {
                        height: 80%;
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

                    #bbgl-sticker-pagination {
                        position: absolute;
                        bottom: 4px;
                        width: 100%;
                        left: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 6px;
                        height: 12px;
                        z-index: 100;
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

                    #bbgl-sticker-title {
                        display: none;
                        position: absolute;
                        top: 7px;
                        right: 10px;
                        font-size: 12px;
                        color: #333;
                        font-family: 'Fjalla One', sans-serif;
                        letter-spacing: .2px;
                        z-index: 99;
                        pointer-events: none;
                        mix-blend-mode: multiply;
                        text-align: right;
                    }

                    .viewing-stickers #bbgl-sticker-title {
                        display: block;
                    }

                    .bbgl-expanded #bbgl-sticker-title {
                        font-size: 15px;
                        top: 8px;
                        right: 20px;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-sticker-title {
                        font-size: clamp(12px, calc(12px + 8px * var(--bbgl-page-t)), 20px);
                        top: clamp(9px, calc(9px + 1px * var(--bbgl-page-t)), 10px);
                        right: clamp(8px, calc(8px + 14px * var(--bbgl-page-t)), 22px);
                    }

                    .copy-hist-btn {
                        position: absolute;
                        top: 4px;
                        right: 5px;
                        width: 14.5px;
                        height: 14.5px;
                        cursor: pointer;
                        z-index: 90;
                        transition: all .2s;
                        user-select: none;
                        opacity: .6;
                        display: none;
                        align-items: center;
                        justify-content: center;
                    }

                    .bbgl-tall .copy-hist-btn,
                    .bbgl-mode-page .copy-hist-btn {
                        display: flex;
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
                    .viewing-achievements .copy-hist-btn {
                        display: none !important;
                    }

                    #bbgl-item-counters {
                        position: absolute;
                        top: 5.5px;
                        right: 10%;
                        display: none;
                        gap: 10px;
                        align-items: center;
                        z-index: 60;
                        pointer-events: none;
                        white-space: nowrap;
                        font-size: 10px;
                        font-weight: 500;
                        color: #bbb;
                        font-family: 'Barlow Condensed', 'Arial Narrow', 'Nimbus Sans Narrow', Tahoma, sans-serif;
                        font-variant-numeric: tabular-nums;
                        height: 14px;
                        pointer-events: auto;
                    }

                    .bbgl-tall #bbgl-item-counters,
                    .bbgl-mode-page #bbgl-item-counters {
                        display: flex;
                    }

                    .viewing-graph #bbgl-item-counters,
                    .viewing-achievements #bbgl-item-counters,
                    .viewing-stickers #bbgl-item-counters {
                        display: none !important;
                    }

                    .bbgl-expanded #bbgl-item-counters {
                        font-size: clamp(11px, 2.1cqi, 12px);
                        top: 6px;
                        right: 38px;
                        gap: clamp(4px, calc(-7px + 3.6cqi), 14px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-item-counters {
                        font-size: clamp(8.5px, calc(8.5px + 5.5px * var(--bbgl-page-t)), 14px);
                        gap: clamp(4px, calc(4px + 10px * var(--bbgl-page-t)), 14px);
                        right: clamp(38px, calc(38px + 4px * var(--bbgl-page-t)), 42px);
                        top: clamp(6px, calc(6px + 4px * var(--bbgl-page-t)), 10px);
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
                        top: clamp(6px, calc(6px + 4px * var(--bbgl-page-t)), 10px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-graph-container .g-hud {
                        margin-top: clamp(2px, calc(3px - 1px * var(--bbgl-page-t)), 3px);
                        margin-bottom: clamp(2px, calc(2px + 1px * var(--bbgl-page-t)), 3px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-graph-container .g-pill {
                        font-size: clamp(8.8px, calc(8.8px + 1.2px * var(--bbgl-page-t)), 10px);
                        padding: clamp(.5px, calc(.5px + 1px * var(--bbgl-page-t)), 1.5px) clamp(3px, calc(3px + 5px * var(--bbgl-page-t)), 8px);
                        line-height: calc(1.18 + .26 * (1 - var(--bbgl-page-t)));
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-graph-container .g-toggles {
                        gap: clamp(4px, calc(4px + 2px * var(--bbgl-page-t)), 6px);
                        align-items: center;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-graph-container .g-text {
                        font-size: clamp(10px, calc(10px + 1px * var(--bbgl-page-t)), 11px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-sticker-pagination {
                        bottom: -2px;
                        gap: clamp(4px, calc(4px + 2px * var(--bbgl-page-t)), 6px);
                    }

                    #bbgl-panel.bbgl-mode-page .pg-dot {
                        width: clamp(5px, calc(5px + 1px * var(--bbgl-page-t)), 6px);
                        height: clamp(5px, calc(5px + 1px * var(--bbgl-page-t)), 6px);
                    }

                    #bbgl-panel.bbgl-mode-page .sticker-nav-btn {
                        font-size: clamp(24px, calc(24px + 8px * var(--bbgl-page-t)), 32px);
                        width: clamp(22px, calc(22px + 18px * var(--bbgl-page-t)), 40px);
                        height: clamp(26px, calc(26px + 6px * var(--bbgl-page-t)), 32px);
                        margin-top: clamp(0px, calc(4px * (1 - var(--bbgl-page-t))), 4px);
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
                        position: center;
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
                        transform-origin: center 75%;
                        transform: rotateX(8deg) scale(.85) translateY(8px);
                    }

                    .bbgl-expanded:not(.bbgl-mode-page) .viewer-obj {
                        transform: rotateX(5deg) scale(clamp(.75, calc(.75 + .08 * (576px - 100cqi) / 256px), .83)) translateY(-15px);
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

                    .viewer-info-overlay {
                        position: absolute;
                        top: calc(50px - var(--bbgl-viewer-title-top-shift));
                        left: 10px;
                        text-align: left;
                        pointer-events: none;
                        z-index: 50;
                    }

                    .vi-name {
                        font-size: 11px;
                        color: #fff;
                        font-weight: 700;
                        text-transform: none;
                    }

                    .bbgl-expanded .viewer-info-overlay {
                        top: calc(75px - var(--bbgl-viewer-title-top-shift));
                        left: 15px;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .viewer-info-overlay {
                        top: calc(10.35cqi + clamp(10px, 4cqi, 15px) - var(--bbgl-viewer-title-top-shift)) !important;
                        left: clamp(10px, 4cqi, 15px) !important;
                    }

                    .bbgl-expanded .vi-name {
                        font-size: 15px;
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
                        height: calc(100vh - 420px + 60px * var(--bbgl-page-t)) !important;
                        min-height: clamp(300px, calc(300px + 200px * var(--bbgl-page-t)), 500px) !important;
                        border: none !important;
                        border-radius: 0 0 5px 5px !important;
                        box-sizing: border-box !important;
                        flex: none !important;
                    }

                    #bbgl-page-container .bbgl-mode-page:has(#bbgl-item-viewer.active) {
                        flex: none !important;
                    }

                    .bbgl-mode-page .viewer-info-overlay {
                        top: clamp(calc(10px - var(--bbgl-viewer-title-top-shift)), calc(10px + 6px * var(--bbgl-page-t) - var(--bbgl-viewer-title-top-shift)), calc(16px - var(--bbgl-viewer-title-top-shift))) !important;
                        left: clamp(10px, calc(10px + 5px * var(--bbgl-page-t)), 15px) !important;
                    }

                    .bbgl-mode-page .vi-name {
                        font-size: clamp(14px, calc(14px + 2px * var(--bbgl-page-t)), 16px) !important;
                    }

                    .bbgl-mode-page .vi-count {
                        font-size: clamp(8px, calc(8px + 1px * var(--bbgl-page-t)), 9px) !important;
                    }

                    .bbgl-mode-page #btn-close-viewer {
                        font-size: clamp(9px, calc(9px + 1px * var(--bbgl-page-t)), 10px) !important;
                        padding: clamp(2px, calc(2px + 0 * var(--bbgl-page-t)), 2px) clamp(5px, calc(5px + 1px * var(--bbgl-page-t)), 6px) !important;
                        top: clamp(4px, calc(4px + 1px * var(--bbgl-page-t)), 5px) !important;
                        right: clamp(4px, calc(4px + 1px * var(--bbgl-page-t)), 5px) !important;
                    }

                    .bbgl-mode-page .viewer-window,
                    .bbgl-mode-page .viewer-stage,
                    .bbgl-mode-page .viewer-pedestal {
                        width: clamp(85%, calc(85% + 7% * var(--bbgl-page-t)), 92%) !important;
                        height: clamp(85%, calc(85% + 7% * var(--bbgl-page-t)), 92%) !important;
                    }

                    .bbgl-mode-page .viewer-obj {
                        transform: rotateX(5deg) scale(calc(1.22 + .33 * (1 - var(--bbgl-page-t)))) translateY(clamp(20px, calc(20px + 5px * (1 - var(--bbgl-page-t))), 25px)) translateX(clamp(10px, calc(10px + 10px * var(--bbgl-page-t)), 20px)) !important;
                    }

                    .bbgl-mode-page #bbgl-sticker-pagination {
                        bottom: -2px !important;
                        padding-bottom: 0;
                    }

                    #bbgl-bottom-panel {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        padding: 0;
                        box-sizing: border-box;
                        overflow: hidden;
                        will-change: transform;
                    }

                    .bbgl-header-wrapper {
                        position: relative;
                        padding: 4px 0 2px 10px;
                        margin-bottom: 0;
                        border-bottom: none;
                        flex: 0 0 85px;
                        overflow: visible;
                        z-index: 20;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-end;
                        transition: flex .3s cubic-bezier(.25, 1, .5, 1);
                    }

                    .bbgl-header-wrapper::before {
                        content: "";
                        position: absolute;
                        top: 4px;
                        left: 4px;
                        right: 4px;
                        bottom: 0;
                        width: auto;
                        height: auto;
                        background-image: url('${ASSETS.HEADER_IMG}');
                        background-size: 100% 100%;
                        background-position: center;
                        opacity: 1;
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
                        padding: 0 8px 0 2px;
                        gap: 8px;
                        position: relative;
                        margin-bottom: 1px;
                        transition: margin-bottom .3s ease;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-month-header {
                        margin-bottom: 6px;
                        gap: clamp(6px, 2.08cqi, 12px);
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
                        padding-left: 2px;
                        display: flex;
                        flex-direction: row;
                        justify-content: flex-start;
                        align-items: center;
                        gap: 8px;
                    }

                    .title-stack {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 3px;
                    }

                    #bbgl-panel.bbgl-expanded .title-stack {
                        gap: 6px;
                    }

                    #bbgl-panel.bbgl-mode-page .title-stack {
                        gap: clamp(6px, calc(6px + 4px * var(--bbgl-page-t)), 10px);
                    }

                    .all-time-btn {
                        width: 20px;
                        height: 20px;
                        color: #ffd700;
                        /**/
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all .2s;
                        margin-top: 4px;
                        margin-bottom: -4px;
                    }

                    .all-time-btn:hover {
                        transform: scale(1.1);
                        filter: drop-shadow(0 0 5px rgba(255, 215, 0, .6));
                    }

                    .all-time-btn svg {
                        width: 100%;
                        height: 100%;
                        fill: currentColor;
                        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .8));
                    }

                    .bbgl-expanded .all-time-btn {
                        width: 30px;
                        height: 30px;
                    }

                    #bbgl-panel.bbgl-mode-page .all-time-btn {
                        width: clamp(28px, calc(28px + 12px * var(--bbgl-page-t)), 40px);
                        height: clamp(28px, calc(28px + 12px * var(--bbgl-page-t)), 40px);
                    }

                    .header-row {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        position: relative;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) .title-stack > .header-row:nth-child(2) {
                        margin-bottom: -2px;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .title-stack > .header-row:nth-child(2) {
                        margin-bottom: -4px;
                    }

                    .stats-btn {
                        width: 18px;
                        height: 18px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        opacity: .9;
                        transition: all .2s;
                        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .8));
                    }

                    .stats-btn:hover {
                        /**/
                        opacity: 1;
                        transform: scale(1.15);
                        filter: drop-shadow(0 0 4px rgba(255, 255, 255, .6));
                    }

                    .stats-btn svg {
                        fill: #fff;
                        width: 100%;
                        height: 100%;
                    }

                    .header-trigger {
                        font-family: 'Fjalla One', 'Arial Narrow', sans-serif;
                        font-weight: 400;
                        color: #fff;
                        cursor: pointer;
                        text-transform: capitalize;
                        user-select: none;
                        text-shadow: 0 2px 4px #000;
                        transition: font-size .3s;
                        line-height: 1;
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

                    /**/
                    #year-trigger {
                        font-size: 10px;
                    }

                    #month-trigger {
                        font-size: 14px;
                    }

                    #bbgl-panel.bbgl-expanded #year-trigger {
                        font-size: 14px;
                    }

                    #bbgl-panel.bbgl-expanded #month-trigger {
                        font-size: 20px;
                    }

                    #bbgl-panel.bbgl-expanded .stats-btn {
                        width: 18px;
                        height: 18px;
                    }

                    #bbgl-panel.bbgl-mode-page #year-trigger {
                        font-size: clamp(14px, calc(14px + 6px * var(--bbgl-page-t)), 20px);
                    }

                    #bbgl-panel.bbgl-mode-page #month-trigger {
                        font-size: clamp(24px, calc(24px + 6px * var(--bbgl-page-t)), 30px);
                    }

                    #bbgl-panel.bbgl-mode-page .stats-btn {
                        width: clamp(24px, calc(24px + 2px * var(--bbgl-page-t)), 26px);
                        height: clamp(24px, calc(24px + 2px * var(--bbgl-page-t)), 26px);
                    }

                    #bbgl-panel.bbgl-mode-page .arrow-btn {
                        font-size: clamp(20px, calc(20px + 8px * var(--bbgl-page-t)), 28px);
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
                        font-size: 13px;
                    }

                    .drop-item:hover {
                        background: #333;
                        color: #fff;
                    }

                    .drop-item.active {
                        background: #ff5722;
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
                        transition: padding .3s ease;
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
                        font-size: 13px;
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
                        -ms-overflow-style: none;
                        scrollbar-width: none;
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
                        user-select: none;
                        -webkit-user-select: none;
                    }

                    .bbgl-day-cell.empty {
                        background: 0 0;
                        box-shadow: none;
                        cursor: default;
                        pointer-events: none;
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

                    @keyframes gold-roll {
                        0% {
                            background-position: 200% 0%;
                            opacity: 0
                        }

                        15% {
                            opacity: 1
                        }

                        100% {
                            background-position: 50% 0%;
                            opacity: 1
                        }
                    }

                    .jewel-type-gold .jewel-asset {
                        transform: rotate(90deg) scale(1.25) translateZ(0);
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                    }

                    .jewel-type-gold .jewel-shine {
                        transform: scale(1.2);
                        filter: brightness(1.2);
                        background: linear-gradient(135deg, transparent 25%, rgba(255, 240, 180, 1) 45%, rgba(255, 255, 255, 1.0) 50%, rgba(255, 240, 180, 1) 55%, transparent 75%);
                        background-size: 200% auto;
                        mix-blend-mode: soft-light;
                        opacity: 0;
                        transition: opacity .2s;
                    }

                    .jewel-type-green .jewel-asset {
                        transform: scale(1.23) translateZ(0);
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                    }

                    .jewel-type-green .jewel-shine {
                        transform: scale(1.18);
                        background: linear-gradient(120deg, transparent 10%, rgba(0, 220, 110, .4) 28%, rgba(180, 255, 210, .95) 40%, rgba(255, 255, 255, 1.0) 50%, rgba(180, 255, 210, .95) 60%, rgba(0, 220, 110, .4) 72%, transparent 90%);
                        background-size: 300% auto;
                        mix-blend-mode: screen;
                        opacity: 0;
                    }

                    .jewel-type-green .jewel-shine-over {
                        position: absolute;
                        z-index: 3;
                        width: 100%;
                        height: 100%;
                        transform: scale(1.23);
                        background: linear-gradient(120deg, transparent 0%, rgba(120, 255, 180, .5) 41%, rgba(255, 255, 255, .7) 50%, rgba(120, 255, 180, .5) 59%, transparent 100%);
                        background-size: 300% auto;
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

                    .jewel-type-diamond .jewel-asset {
                        transform-origin: bottom left;
                        transform: translate(-6%, 6%) scale(1.08, 1.06) translateZ(0);
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                    }

                    .jewel-type-diamond .jewel-shine {
                        transform-origin: bottom left;
                        transform: translate(-3%, 3%) scale(1.02, 1.00);
                        background: linear-gradient(120deg, transparent 10%, rgba(0, 220, 110, .4) 28%, rgba(180, 255, 210, .95) 40%, rgba(255, 255, 255, 1.0) 50%, rgba(180, 255, 210, .95) 60%, rgba(0, 220, 110, .4) 72%, transparent 90%);
                        background-size: 300% auto;
                        mix-blend-mode: screen;
                        opacity: 0;
                    }

                    .jewel-type-diamond .jewel-shine-over {
                        position: absolute;
                        z-index: 3;
                        width: 100%;
                        height: 100%;
                        transform-origin: bottom left;
                        transform: translate(-3%, 3%) scale(1.02, 1.00);
                        background: linear-gradient(120deg, transparent 0%, rgba(120, 255, 180, .5) 41%, rgba(255, 255, 255, .7) 50%, rgba(120, 255, 180, .5) 59%, transparent 100%);
                        background-size: 300% auto;
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

                    @keyframes green-flash {
                        0% {
                            background-position: 250% 0%;
                            opacity: 0
                        }

                        20% {
                            opacity: .9
                        }

                        100% {
                            background-position: 50% 0%;
                            opacity: .75
                        }
                    }

                    @keyframes green-flash-over {
                        0% {
                            background-position: 250% 0%;
                            opacity: 0
                        }

                        20% {
                            opacity: .72
                        }

                        100% {
                            background-position: 50% 0%;
                            opacity: .95
                        }
                    }

                    @keyframes diamond-flash {
                        0% {
                            background-position: 250% 0%;
                            opacity: 0
                        }

                        20% {
                            opacity: .9
                        }

                        100% {
                            background-position: 50% 0%;
                            opacity: .75
                        }
                    }

                    @keyframes diamond-flash-over {
                        0% {
                            background-position: 250% 0%;
                            opacity: 0
                        }

                        20% {
                            opacity: .72
                        }

                        100% {
                            background-position: 50% 0%;
                            opacity: .95
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
                        background: url('https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/new-stkr.png') no-repeat center / contain;
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

                    .sticker-shine {
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(200, 250, 255, .001) 30%, rgba(255, 255, 255, .01) 50%, rgba(255, 200, 220, .001) 70%, rgba(255, 255, 255, 0) 100%);
                        background-size: 400% 400%;
                        background-position: var(--bg-x, 50%) var(--bg-y, 50%);
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

                    @keyframes bbgl-auto-shimmer {
                        0% {
                            opacity: .85;
                            background-position: 0% 0%
                        }

                        100% {
                            opacity: .85;
                            background-position: 100% 100%
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
                        animation: gold-roll 1.2s cubic-bezier(.3, 0, .55, 1) 1 forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) .jewel-type-green .jewel-shine {
                        opacity: 1;
                        animation: green-flash 1.7s ease-out 1 forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) .jewel-type-diamond .jewel-shine {
                        opacity: 1;
                        animation: diamond-flash 1.7s ease-out 1 forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) .jewel-type-green .jewel-shine-over {
                        opacity: 1;
                        animation: green-flash-over 1.7s ease-out 1 forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) .jewel-type-diamond .jewel-shine-over {
                        opacity: 1;
                        animation: diamond-flash-over 1.7s ease-out 1 forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) .sticker-shine {
                        animation: bbgl-auto-shimmer 2.4s cubic-bezier(.3, 0, .55, 1) 2 alternate forwards;
                        opacity: 1;
                    }

                    .day-num {
                        position: absolute;
                        top: 3px;
                        left: 2px;
                        font-size: 10px;
                        width: 18px;
                        height: 18px;
                        color: #fff;
                        font-weight: 400;
                        font-family: 'Fjalla One', 'Arial', sans-serif;
                        pointer-events: none;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        transition: all .2s;
                        z-index: 20;
                    }

                    .bbgl-day-cell.ghost-cell .day-num {
                        color: #999;
                    }

                    body:not(.is-touch-device) .bbgl-day-cell:not(.empty):not(.is-viewing):hover .day-num,
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

                    #bbgl-panel.bbgl-expanded .bbgl-day-cell.is-viewing .day-num {
                        font-size: 19px !important;
                    }

                    .bbgl-weekly-anchor {
                        width: 100%;
                        height: 6px;
                        position: relative;
                        z-index: 20;
                    }

                    .bbgl-weekly-track {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        height: 8px;
                        display: flex;
                        cursor: pointer;
                        transition: height .2s cubic-bezier(.18, .89, .32, 1.28);
                        border-radius: 0 4px 4px 0;
                        overflow: hidden;
                        pointer-events: auto;
                        background: repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(255, 255, 255, .03) 1px, rgba(255, 255, 255, .03) 2px), linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%);
                        box-shadow: inset 0 2px 5px rgba(0, 0, 0, .8), inset 0 -1px 0 rgba(255, 255, 255, .05), 0 0 1px #000;
                    }

                    body:not(.is-touch-device) .bbgl-weekly-track:hover,
                    .bbgl-weekly-track.is-scrub-hovered {
                        height: 14px;
                        z-index: 100;
                    }

                    .bbgl-weekly-track.is-viewing {
                        height: 14px;
                        z-index: 80;
                        box-shadow: 0 0 5px rgba(255, 255, 255, .3), inset 0 2px 5px rgba(0, 0, 0, .8);
                    }

                    .bbgl-weekly-track.is-viewing .bbgl-track-label {
                        opacity: 1;
                    }

                    .bbgl-weekly-track.track-solidified {
                        background: repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(0, 0, 0, .15) 1px, rgba(0, 0, 0, .15) 2px), linear-gradient(180deg, #333 0%, #555 30%, #999 60%, #555 70%, #222 100%);
                        box-shadow: inset 0 0 2px rgba(255, 255, 255, .2), 0 1px 2px rgba(0, 0, 0, .8);
                        border-top: 1px solid rgba(255, 255, 255, .1);
                        z-index: 1;
                    }

                    .bbgl-weekly-track.track-solidified .bbgl-seg {
                        box-shadow: none;
                    }

                    .bbgl-weekly-track.track-polished {
                        box-shadow: 0 1px 3px rgba(0, 0, 0, .5);
                    }

                    .bbgl-weekly-track.track-polished::after {
                        content: "";
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .5), transparent);
                        opacity: .7;
                        pointer-events: none;
                        z-index: 50;
                        animation: bbgl-sheen-loop 7s linear infinite;
                    }

                    @keyframes bbgl-sheen-loop {
                        0% {
                            transform: skewX(-20deg) translateX(-150%)
                        }

                        21% {
                            transform: skewX(-20deg) translateX(250%)
                        }

                        21.01%,
                        100% {
                            transform: skewX(-20deg) translateX(-150%)
                        }
                    }

                    #bbgl-panel.bbgl-no-animations .bbgl-day-cell.is-viewing :is(.jewel-type-gold .jewel-shine, .jewel-type-green .jewel-shine, .jewel-type-green .jewel-shine-over, .jewel-type-diamond .jewel-shine, .jewel-type-diamond .jewel-shine-over, .sticker-shine) {
                        animation: none !important;
                        opacity: 0 !important;
                    }

                    #bbgl-panel.bbgl-no-animations .bbgl-weekly-track.track-polished::after {
                        display: none;
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

                    .bbgl-seg {
                        height: 100%;
                        box-sizing: border-box;
                        position: relative;
                        border: none;
                    }

                    .bbgl-seg.seg-rounded-end {
                        border-top-right-radius: 10px;
                        border-bottom-right-radius: 10px;
                        box-shadow: 2px 0 3px rgba(0, 0, 0, .5);
                        z-index: 5;
                    }

                    .seg-brushed-green,
                    .seg-brushed-gold,
                    .seg-brushed-diamond {
                        box-shadow: inset 0 0 2px rgba(0, 0, 0, .5);
                        border-top: 1px solid rgba(255, 255, 255, .1);
                    }

                    .seg-brushed-green {
                        background: repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(0, 0, 0, .15) 1px, rgba(0, 0, 0, .15) 2px), linear-gradient(180deg, #203a10 0%, #355e1a 30%, #609438 60%, #355e1a 70%, #15290a 100%);
                    }

                    .seg-brushed-gold {
                        background: repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(0, 0, 0, .15) 1px, rgba(0, 0, 0, .15) 2px), linear-gradient(180deg, #3e2b05 0%, #6b4c0a 30%, #aa8530 60%, #6b4c0a 70%, #2e1f02 100%);
                    }

                    .seg-brushed-diamond {
                        background: repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(0, 0, 0, .2) 1px, rgba(0, 0, 0, .2) 2px), linear-gradient(110deg, rgba(255, 100, 180, .6) 0%, rgba(100, 255, 180, .6) 33%, rgba(100, 180, 255, .6) 66%, rgba(200, 100, 255, .6) 100%), linear-gradient(180deg, #111 0%, #555 35%, #bbb 45%, #bbb 55%, #555 65%, #111 100%);
                        background-blend-mode: normal, overlay, normal;
                    }

                    .seg-polished-green {
                        background: linear-gradient(180deg, #0d2b05 0%, #3a7a13 35%, #aaff66 45%, #3a7a13 65%, #0d2b05 100%);
                    }

                    .seg-polished-gold {
                        background: linear-gradient(180deg, #3d2200 0%, #8f6205 35%, #fff7cc 45%, #fff7cc 55%, #8f6205 65%, #3d2200 100%);
                    }

                    .seg-polished-diamond {
                        background: linear-gradient(110deg, rgba(255, 80, 180, .9) 0%, rgba(80, 255, 180, .9) 33%, rgba(80, 180, 255, .9) 66%, rgba(200, 80, 255, .9) 100%), linear-gradient(180deg, #111 0%, #777 35%, #fff 45%, #fff 55%, #777 65%, #111 100%);
                        background-blend-mode: overlay, normal;
                    }

                    .bbgl-track-label {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        justify-content: center;
                        display: flex;
                        align-items: center;
                        font-size: 10.5px;
                        font-family: 'Fjalla One', 'Arial Narrow', sans-serif;
                        font-weight: 700;
                        color: #fff;
                        text-shadow: 0 0 3px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 1);
                        letter-spacing: 0.5px;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity .2s;
                        white-space: nowrap;
                        z-index: 60;
                    }

                    body:not(.is-touch-device) .bbgl-weekly-track:hover .bbgl-track-label,
                    .bbgl-weekly-track.is-scrub-hovered .bbgl-track-label {
                        opacity: 1;
                    }

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
                        padding: 0 !important;
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

                    .bbgl-settings-scroll-area {
                        flex: 1;
                        overflow-y: auto;
                        overflow-x: hidden;
                        padding: 8px;
                        width: 100%;
                        box-sizing: border-box;
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }

                    /**/
                    .ledger-content::-webkit-scrollbar,
                    .calendar-wrapper::-webkit-scrollbar,
                    .bbgl-settings-scroll-area::-webkit-scrollbar {
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
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }

                    .bbgl-modal-window::-webkit-scrollbar {
                        display: none;
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

                    /**/
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
                        align-items: flex-start;
                        padding: 4px 0;
                        color: #ccc;
                    }

                    .bbgl-ack-row input[type="checkbox"] {
                        margin-top: 2px;
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
                            transform: translateY(-60%) !important;
                            text-shadow: 0 1px 3px #000 !important;
                        }

                        .arrow-btn:hover {
                            transform: none !important;
                            text-shadow: 0 1px 3px #000 !important;
                        }

                        .sticker-nav-btn:active {
                            transform: translateY(-50%) scale(1.3) !important;
                            text-shadow: 0 0 8px rgba(255, 255, 255, .8) !important;
                        }

                        .arrow-btn:active {
                            transform: scale(1.3) !important;
                            text-shadow: 0 0 8px rgba(255, 255, 255, .8) !important;
                        }

                        #bbgl-panel:not(.bbgl-expanded) {
                            max-height: none !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-pill {
                            font-size: 9.5px !important;
                            padding: .5px 5px !important;
                            line-height: 1.18 !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-toggles {
                            gap: 4px !important;
                            align-items: center !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-hud {
                            margin-bottom: 2px !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-text {
                            font-size: 9px !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-text.x-label {
                            font-size: 9px !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .stats-btn {
                            width: 28px !important;
                            height: 28px !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-ledger-toggle,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-achievements-toggle,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-copy-btn {
                            width: 15.5px !important;
                            height: 15.5px !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-toggle,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-toggle {
                            width: 16px !important;
                            height: 16px !important;
                        }
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-header-wrapper {
                        flex: 0 0 clamp(122px, calc(122px + 23px * var(--bbgl-dock-t, 0)), 145px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-header-wrapper::before {
                        left: 0 !important;
                        right: 0 !important;
                        top: 0 !important;
                        border-radius: 5px 5px 0 0 !important;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) {
                        --bbgl-dock-t: clamp(0, calc((100cqi - 350px) / 370px), 1);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page):not(.bbgl-tall) {
                        --bbgl-col-gap: clamp(10px, calc(10px + 12px * (1 - var(--bbgl-dock-t, 0))), 22px);
                        --bbgl-f-top-mb: clamp(3px, calc(3px + 3px * (1 - var(--bbgl-dock-t, 0))), 6px);
                    }

                    #bbgl-panel.bbgl-expanded.bbgl-tall:not(.bbgl-mode-page) {
                        /* ledger spacing inverse-scale (tall) */
                        --bbgl-col-gap: clamp(12px, calc(12px + 14px * (1 - var(--bbgl-dock-t, 0))), 26px);
                        --bbgl-f-top-mb: clamp(3px, calc(3px + 3px * (1 - var(--bbgl-dock-t, 0))), 6px);
                    }

                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-bottom-panel {
                        overflow-y: auto !important;
                        overflow-x: hidden !important;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) .bbgl-grid-container {
                        padding: 0 !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-month-header {
                        padding-left: 8px !important;
                        padding-right: clamp(10px, 2.78cqi, 16px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .day-num {
                        font-size: clamp(11px, 2.78cqi, 16px) !important;
                        top: clamp(3px, 1.04cqi, 6px) !important;
                        left: clamp(3px, 1.04cqi, 6px) !important;
                        width: clamp(20px, 5.2cqi, 30px) !important;
                        height: clamp(20px, 5.2cqi, 30px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-day-cell.is-viewing .day-num {
                        font-size: clamp(15px, 3.82cqi, 22px) !important;
                        width: clamp(24px, 6.25cqi, 36px) !important;
                        height: clamp(24px, 6.25cqi, 36px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-ledger-toggle,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-achievements-toggle,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-copy-btn,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-ledger-toggle svg,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-achievements-toggle svg,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-copy-btn svg {
                        width: 15.5px !important;
                        height: 15.5px !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-toggle,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-toggle,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-toggle svg,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-toggle svg {
                        width: 16px !important;
                        height: 16px !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-ledger-toggle {
                        /**/
                        left: 32px !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-toggle {
                        left: clamp(56px, calc(51.6px + 1.45cqi), 60px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-achievements-toggle {
                        left: clamp(80px, calc(71.2px + 2.9cqi), 88px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-toggle {
                        left: clamp(104px, calc(90.8px + 4.35cqi), 116px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .arrow-btn {
                        font-size: clamp(18px, 3.65cqi, 21px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .all-time-btn {
                        width: 33px !important;
                        height: 33px !important;
                        margin-top: 8px !important;
                        margin-bottom: -8px !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #year-trigger {
                        font-size: clamp(14px, 2.78cqi, 16px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #month-trigger {
                        font-size: clamp(20px, 3.99cqi, 23px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .ui-floating-label,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .ui-floating-summary {
                        font-size: clamp(11px, 2.08cqi, 12px) !important;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .ui-floating-label,
                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .ui-floating-summary {
                        font-size: 10.5px !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .stats-btn {
                        width: 28px !important;
                        height: 28px !important;
                    }

                    /* Expanded panel graph view: fluid scaling to replace hard 620px breakpoint ---------------------*/
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-pill {
                        font-size: clamp(8.45px, 1.62cqi, 10px) !important;
                        /* narrow panels dip below old 9.8px floor --------*/
                        padding: clamp(.5px, calc(.35px + .16cqi), 1.5px) clamp(5px, 1.39cqi, 8px) !important;
                        line-height: 1 !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        box-sizing: border-box !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-toggles {
                        gap: clamp(4px, 1.04cqi, 6px) !important;
                        align-items: center !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-hud {
                        margin-bottom: clamp(4px, 1.12cqi, 6px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-text {
                        font-size: clamp(10px, 1.91cqi, 11px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container {
                        padding: clamp(5px, .72cqi, 9px) calc(var(--bbgl-gx, 10px) - 2px) clamp(4px, .65cqi, 7px) calc(var(--bbgl-gx, 10px) - 2px) !important;
                    }

                    /* Expanded panel sticker grid: fluid sticker slot sizing to keep proportions --------------------*/
                    /* Switch to size containment on expanded panel only so cqi/cqb can read both axes. --------------*/
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) {
                        container-type: size;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-top-panel.viewing-achievements #bbgl-achievements-container {
                        --bbgl-ach-inset-x: clamp(0px, .55vw, 6px);
                        --bbgl-ach-container-pt: max(0px, calc(clamp(10px, calc(21px - 10.5px * var(--bbgl-dock-t, 0)), 21px) - calc(2px * var(--bbgl-dock-t, 0))));
                        --bbgl-ach-scroll-pt: clamp(1px, .48cqi, 8px);
                        --bbgl-ach-scroll-pb: clamp(0px, .06cqi, 2px);
                        --bbgl-ach-footer-pt: clamp(0px, .06cqi, 1px);
                        --bbgl-ach-footer-pb: 2px;
                        padding-top: var(--bbgl-ach-container-pt) !important;
                        padding-left: var(--bbgl-ach-inset-x) !important;
                        padding-right: var(--bbgl-ach-inset-x) !important;
                        min-height: 0 !important;
                        flex: 1 !important;
                        overflow: hidden !important;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-top-panel.viewing-achievements #bbgl-achievements-container .bbgl-ach-scroll {
                        flex: 1 1 auto !important;
                        min-height: 0 !important;
                        overflow: hidden !important;
                        overflow-x: hidden !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-top-panel.viewing-achievements #bbgl-achievements-container {
                        --bbgl-ach-inset-x: clamp(4px, 1vw, 12px);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .sticker-slot {
                        height: min(clamp(88px, calc(75px + 2.6cqi), 88px), clamp(88px, calc(75px + 2.4cqb), 88px)) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .sticker-slot-sponsor {
                        height: min(clamp(110px, calc(90px + 8.1cqi), 137px), clamp(110px, calc(90px + 7.4cqb), 137px)) !important;
                        max-width: clamp(120px, calc(100px + 9cqi), 152px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-grid {
                        column-gap: clamp(1px, calc(.8cqi), 5px) !important;
                        row-gap: clamp(0px, calc(.4cqi), 3px) !important;
                        align-content: center !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .sticker-nav-btn {
                        font-size: clamp(20px, calc(14px + 3.1cqi), 32px) !important;
                        width: clamp(24px, calc(17px + 4cqi), 40px) !important;
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

                    @keyframes bbgl-gold-glow-once {
                        0% {
                            text-shadow: 0 0 0 rgba(255, 215, 0, 0), 0 1px 3px rgba(0, 0, 0, .85);
                        }

                        100% {
                            text-shadow: 0 0 18px rgba(255, 235, 120, 1), 0 0 32px rgba(255, 215, 0, .9), 0 0 50px rgba(255, 200, 0, .55), 0 1px 3px rgba(0, 0, 0, .85);
                        }
                    }

                    #sticker-sponsor-btn {
                        left: 0;
                        border-radius: 0 5px 5px 0;
                        background: linear-gradient(135deg, #b8860b 0%, #ffd700 40%, #fffacd 50%, #ffd700 60%, #b8860b 100%);
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        color: transparent;
                        text-shadow: 0 0 12px rgba(255, 215, 0, .6), 0 0 0 rgba(255, 255, 255, 0), 0 1px 3px rgba(0, 0, 0, .85);
                    }

                    @media (hover: hover) {
                        #sticker-sponsor-btn:hover {
                            text-shadow: 0 0 18px rgba(255, 235, 120, 1), 0 0 24px rgba(255, 255, 255, .8), 0 1px 3px rgba(0, 0, 0, .85);
                        }
                    }

                    #sticker-sponsor-btn:active {
                        text-shadow: 0 0 18px rgba(255, 235, 120, 1), 0 0 24px rgba(255, 255, 255, .8), 0 1px 3px rgba(0, 0, 0, .85);
                    }

                    #sticker-sponsor-btn.shimmer-once {
                        animation: bbgl-gold-glow-once 2s ease-in-out forwards;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #sticker-sponsor-btn {
                        left: 0 !important;
                    }

                    #bbgl-panel.bbgl-mode-page #sticker-sponsor-btn {
                        left: clamp(0px, calc(6px * (1 - var(--bbgl-page-t))), 6px);
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
                        gap: 0 !important;
                        padding: 0 !important;
                        margin: 0 -10px !important;
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
                        height: 137px !important;
                        max-width: 152px !important;
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
                        font-size: 11px;
                    }

                    #bbgl-panel.bbgl-mode-page .sponsor-sticker-label {
                        font-size: clamp(8px, calc(8px + 5px * var(--bbgl-page-t)), 13px);
                    }

                    .pg-dot.pg-dot-sponsor.active {
                        background: linear-gradient(135deg, #b8860b, #ffd700, #fffacd, #ffd700, #b8860b) !important;
                        box-shadow: 0 0 6px rgba(255, 215, 0, .85) !important;
                        transform: scale(1.3);
                    }

                    .bbgl-ach-scroll {
                        display: flex;
                        flex-direction: column;
                        flex: 1 1 auto;
                        min-height: 0;
                        overflow: hidden;
                        overflow-x: hidden;
                        padding: var(--bbgl-ach-scroll-pt) var(--bbgl-ach-inset-x) var(--bbgl-ach-scroll-pb);
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                        box-sizing: border-box;
                    }

                    .bbgl-ach-scroll::-webkit-scrollbar {
                        display: none;
                    }

                    #bbgl-achievements-container {
                        position: relative;
                        min-height: 0;
                        overflow: hidden;
                        container-type: inline-size;
                        container-name: bbgl-ach-root;
                        --bbgl-ach-font: 'Barlow Condensed', 'Arial Narrow', 'Nimbus Sans Narrow', Tahoma, sans-serif;
                        --bbgl-ach-val-font: 'Inconsolata', monospace;
                        --bbgl-ach-inset-x: clamp(2px, 1.1cqi, 12px);
                        --bbgl-ach-scroll-pt: clamp(2px, .5cqi, 9px);
                        --bbgl-ach-scroll-pb: clamp(0px, .08cqi, 2px);
                        --bbgl-ach-footer-pt: clamp(0px, .08cqi, 2px);
                        --bbgl-ach-footer-pb: 2px;
                        --bbgl-ach-footer-gap: 6px;
                        --bbgl-ach-dot-gap: 6px;
                        /* stickerbook #bbgl-sticker-pagination --------*/
                        --bbgl-ach-dot-w: 6px;
                        --bbgl-ach-nav-fs: clamp(7px, calc(1.45 * var(--bbgl-ach-dot-w)), 11px);
                        --bbgl-ach-nav-py: 0;
                        --bbgl-ach-nav-px: clamp(2px, .55cqi, 10px);
                    }

                    #bbgl-ach-pages {
                        container-type: inline-size;
                        container-name: bbgl-ach;
                        /**/
                        width: 100%;
                        box-sizing: border-box;
                        flex: 1;
                        min-height: 0;
                        overflow: hidden;
                    }

                    #bbgl-ach-footer,
                    .bbgl-ach-footer {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        z-index: 10;
                        flex-shrink: 0;
                        display: grid;
                        grid-template-columns: 1fr auto 1fr;
                        align-items: center;
                        column-gap: var(--bbgl-ach-footer-gap);
                        min-height: 0;
                        padding: var(--bbgl-ach-footer-pt) var(--bbgl-ach-inset-x) var(--bbgl-ach-footer-pb);
                        box-sizing: border-box;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) #bbgl-ach-footer {
                        padding-bottom: 0px;
                    }

                    .bbgl-ach-footer-side {
                        display: flex;
                        align-items: center;
                        min-width: 0;
                    }

                    .bbgl-ach-footer-left {
                        justify-content: flex-end;
                    }

                    .bbgl-ach-footer-right {
                        justify-content: flex-start;
                    }

                    .bbgl-ach-nav {
                        position: relative;
                        top: auto;
                        transform: none;
                        font-size: var(--bbgl-ach-nav-fs);
                        color: #888;
                        cursor: pointer;
                        z-index: 20;
                        user-select: none;
                        padding: var(--bbgl-ach-nav-py) var(--bbgl-ach-nav-px);
                        margin: 0;
                        transition: color .2s;
                        font-family: 'Arial', sans-serif;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        background: transparent;
                        border: none;
                        line-height: 1;
                        -webkit-appearance: none;
                        appearance: none;
                    }

                    body:not(.is-touch-device) .bbgl-ach-nav:hover {
                        color: #fff;
                        text-shadow: 0 0 3px #fff;
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

                    .bbgl-ach-section-title {
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
                        padding: 2px;
                        color: #9a9a9a;
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(11px, 2.2cqi, 13px);
                        font-weight: 700;
                        letter-spacing: .10em;
                        text-transform: uppercase;
                        line-height: 1.25;
                        border-bottom: 1px solid rgba(255, 255, 255, .12);
                        transition: color .15s;
                    }

                    /**/
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
                        font-size: clamp(10px, 1.8cqi, 11px);
                        font-weight: 600;
                        letter-spacing: .08em;
                        text-transform: uppercase;
                        line-height: 1.2;
                        transition: color .15s;
                    }

                    /**/
                    body:not(.is-touch-device) .bbgl-ach-section-title:hover,
                    body:not(.is-touch-device) .bbgl-ach-subsection-title:hover {
                        color: #c8c8c8;
                    }

                    .bbgl-ach-cols {
                        display: grid;
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                        column-gap: clamp(8px, 2.2cqi, 18px);
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
                        gap: clamp(2px, .45cqi, 5px);
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
                        column-gap: clamp(8px, 2.2cqi, 18px);
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
                        column-gap: clamp(8px, 2.2cqi, 18px);
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

                    .bbgl-ach-row {
                        display: flex;
                        flex-direction: column;
                        align-items: stretch;
                        padding: clamp(2px, .4cqi, 4px) 1px;
                        margin: 0;
                        border: none;
                        box-shadow: none;
                        background: 0 0;
                        cursor: pointer;
                        position: relative;
                        font-size: clamp(10px, 2.05cqi, 12px);
                        line-height: 1.4;
                    }

                    .bbgl-expanded .bbgl-ach-row {
                        font-size: clamp(12px, 2.05cqi, 12px);
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
                        font-size: clamp(7.5px, 1.55cqi, 9px);
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

                    .bbgl-ach-row .ach-value.ach-stat-str {
                        color: #3264c6;
                    }

                    .bbgl-ach-row .ach-value.ach-stat-def {
                        color: #dc3912;
                    }

                    .bbgl-ach-row .ach-value.ach-stat-spd {
                        color: #ff9900;
                    }

                    .bbgl-ach-row .ach-value.ach-stat-dex {
                        color: #109618;
                    }

                    .bbgl-ach-row .ach-value.ach-stat-tot {
                        color: #9d039d;
                    }

                    .ach-null {
                        color: #444;
                    }

                    .ach-unit {
                        display: none;
                    }

                    .bbgl-ach-row .ach-value.ach-happy-col {
                        display: none;
                        color: #eaeaea;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-row .ach-value.ach-happy-col,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-row .ach-value.ach-happy-col {
                        display: inline-flex;
                    }

                    #bbgl-panel.bbgl-expanded .ach-unit,
                    #bbgl-panel.bbgl-mode-page .ach-unit {
                        display: inline;
                    }

                    .ach-date {
                        display: none;
                        font-size: clamp(10px, 2.1cqi, 12px);
                        font-weight: 500;
                        color: #999;
                        font-family: var(--bbgl-ach-font);
                        text-align: left;
                        margin-left: 6px;
                        line-height: 1;
                        letter-spacing: .01em;
                    }

                    #bbgl-panel.bbgl-expanded .ach-date,
                    #bbgl-panel.bbgl-mode-page .ach-date {
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
                        justify-self: center;
                        gap: var(--bbgl-ach-dot-gap);
                        padding: 0;
                        flex-shrink: 0;
                    }

                    #bbgl-ach-pageindicator .pg-dot {
                        width: var(--bbgl-ach-dot-w);
                        height: var(--bbgl-ach-dot-w);
                    }

                    #bbgl-ach-pageindicator .pg-dot.active {
                        transform: scale(1.2);
                        box-shadow: 0 0 clamp(3px, calc(2px + .55cqi), 8px) rgba(255, 255, 255, .5);
                    }

                    .bbgl-ach-section-page0 {
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .bbgl-ach-section-page0 .bbgl-ach-grid-header,
                    .bbgl-ach-section-page0 .bbgl-ach-row-multi {
                        display: grid;
                        grid-template-columns: minmax(0, 20%) repeat(4, minmax(0, 1fr));
                        column-gap: clamp(4px, 1cqi, 10px);
                        align-items: start;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .bbgl-ach-section-page0 .bbgl-ach-grid-header {
                        border-bottom: 1px solid rgba(255, 255, 255, .12);
                        padding: 2px 2px 4px;
                        align-items: end;
                    }

                    .bbgl-ach-section-page0 .bbgl-ach-row-multi {
                        padding: clamp(2px, .4cqi, 4px) 2px;
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

                    /**/
                    .bbgl-ach-section-page0 .ach-grid-label-area .ach-k {
                        font-weight: 500;
                        color: #bbb;
                        font-family: var(--bbgl-ach-font);
                        /**/
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

                    #bbgl-panel.bbgl-expanded .bbgl-ach-section-page0 .bbgl-ach-grid-header .bbgl-ach-section-title,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-section-page0 .bbgl-ach-grid-header .bbgl-ach-section-title {
                        white-space: nowrap;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-section-page0 .bbgl-ach-grid-header .bbgl-ach-section-hint,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-section-page0 .bbgl-ach-grid-header .bbgl-ach-section-hint {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        margin-top: 0;
                        min-width: 0;
                        white-space: normal;
                        word-break: normal;
                        overflow-wrap: normal;
                        align-self: center;
                        font-size: clamp(6.5px, 1.25cqi, 8.5px);
                        line-height: 1.1;
                        max-height: calc(1.1em * 2 + 1px);
                    }

                    .bbgl-ach-section-hint {
                        display: none;
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(7px, 1.4cqi, 9px);
                        color: #666;
                        letter-spacing: .02em;
                        line-height: 1.15;
                        margin-top: 1px;
                        font-weight: 400;
                        text-transform: none;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-section-hint,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-section-hint {
                        display: block;
                    }

                    .ach-paren {
                        display: none;
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(7.5px, 1.5cqi, 9.5px);
                        color: #777;
                        font-weight: 400;
                        line-height: 1.15;
                        margin-top: 1px;
                        letter-spacing: .01em;
                    }

                    #bbgl-panel.bbgl-expanded .ach-paren,
                    #bbgl-panel.bbgl-mode-page .ach-paren {
                        display: block;
                    }

                    .ach-stat-header {
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(9px, 1.85cqi, 11px);
                        font-weight: 700;
                        letter-spacing: .04em;
                        text-align: center;
                        line-height: 1.2;
                    }

                    .ach-stat-header.ach-stat-str {
                        color: #3264c6;
                    }

                    .ach-stat-header.ach-stat-def {
                        color: #dc3912;
                    }

                    .ach-stat-header.ach-stat-spd {
                        color: #ff9900;
                    }

                    .ach-stat-header.ach-stat-dex {
                        color: #109618;
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
                        font-size: clamp(11px, 2.15cqi, 13px);
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
                        font-size: clamp(9.5px, 1.9cqi, 11.5px);
                        color: #888;
                        text-align: center;
                        margin: 0;
                        line-height: 1.15;
                        font-variant-numeric: tabular-nums;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-stat-cell .ach-date,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-stat-cell .ach-date,
                    #bbgl-panel.bbgl-expanded .bbgl-ach-stat-cell .ach-time,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-stat-cell .ach-time {
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

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page0 .bbgl-ach-grid-header,
                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page0 .bbgl-ach-row-multi {
                        grid-template-columns: minmax(0, 28%) repeat(4, minmax(0, 1fr));
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-title {
                        font-size: clamp(10px, 2cqi, 12px);
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-subsection-title {
                        font-size: clamp(9px, 1.6cqi, 10px);
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

                    #bbgl-panel.bbgl-expanded .ach-streak-days-inline,
                    #bbgl-panel.bbgl-mode-page .ach-streak-days-inline {
                        /**/
                        display: none;
                    }

                    .ach-stat-header.ach-stat-tot {
                        color: #9d039d;
                    }

                    .bbgl-ach-section-page1 .bbgl-ach-grid-header,
                    .bbgl-ach-section-page1 .bbgl-ach-row-multi {
                        grid-template-columns: minmax(0, 28%) repeat(5, minmax(0, 1fr));
                    }

                    .bbgl-ach-stat-cell .ach-value.ach-stat-tot {
                        color: #9d039d;
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

                    #bbgl-panel.bbgl-expanded .bbgl-ach-streak-date-inline,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-streak-date-inline {
                        display: none;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page1 .bbgl-ach-grid-header,
                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page1 .bbgl-ach-row-multi {
                        grid-template-columns: minmax(0, 1fr) repeat(4, 0fr) auto;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page1 .bbgl-ach-stat-cell:not(.bbgl-ach-stat-cell-total),
                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page1 .ach-stat-header:not(.ach-stat-tot) {
                        display: none;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page1 .bbgl-ach-stat-cell-total .ach-value {
                        text-align: right;
                        justify-content: flex-end;
                    }

                    .bbgl-ach-consistency-row {
                        cursor: pointer;
                    }

                    body:not(.is-touch-device) .bbgl-ach-consistency-row:hover {
                        background: transparent !important;
                    }

                    .bbgl-ach-consistency-row .bbgl-ach-consistency-text {
                        grid-column: 1 / -1;
                        justify-self: end;
                        text-align: right;
                        /**/
                        padding: 2px 6px;
                        border-radius: 4px;
                        transition: background-color .12s;
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(10px, 2cqi, 13px);
                        color: #bbb;
                        /**/
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
                        /**/
                        font-variant-numeric: tabular-nums;
                        font-weight: 600;
                    }

                    .bbgl-ach-consistency-row .ach-cons-days {
                        color: #888;
                        font-family: var(--bbgl-ach-val-font);
                        /**/
                        font-variant-numeric: tabular-nums;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-section-page0 .ach-k,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-section-page0 .ach-k {
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

                    #bbgl-panel.bbgl-expanded .ach-title-short,
                    #bbgl-panel.bbgl-mode-page .ach-title-short {
                        display: none;
                    }

                    #bbgl-panel.bbgl-expanded .ach-title-long,
                    #bbgl-panel.bbgl-mode-page .ach-title-long {
                        display: inline;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page0 .bbgl-ach-row-multi {
                        padding-top: 1px;
                        padding-bottom: 1px;
                    }

                    .ach-cons-long {
                        display: none;
                    }

                    .ach-cons-short {
                        display: inline;
                    }

                    #bbgl-panel.bbgl-expanded .ach-cons-short,
                    #bbgl-panel.bbgl-mode-page .ach-cons-short {
                        display: none;
                    }

                    #bbgl-panel.bbgl-expanded .ach-cons-long,
                    #bbgl-panel.bbgl-mode-page .ach-cons-long {
                        display: inline;
                    }

                    .bbgl-ach-section-hh {
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .bbgl-ach-section-hh .bbgl-ach-row {
                        padding: clamp(2px, .4cqi, 4px) 2px;
                        border-bottom: 1px solid rgba(255, 255, 255, .05);
                        font-size: clamp(11px, 2.05cqi, 13px) !important;
                    }

                    .bbgl-ach-hh-best-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 8px;
                        width: 100%;
                        box-sizing: border-box;
                        padding: clamp(3px, .5cqi, 5px) 2px;
                        border-bottom: 1px solid rgba(255, 255, 255, .05);
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(11px, 2.05cqi, 13px);
                        color: #ccc;
                        line-height: 1.4;
                    }

                    .bbgl-ach-section-hh .bbgl-ach-row:last-of-type,
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
                        background: transparent !important;
                        cursor: inherit;
                    }

                    .bbgl-ach-hh-group .bbgl-ach-hh-best-row {
                        border-bottom: none;
                    }

                    .bbgl-ach-hh-label {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        gap: clamp(6px, 1.2cqi, 10px);
                        min-width: 0;
                        flex: 1;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-hh-label,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-label {
                        flex-direction: column;
                        align-items: flex-start;
                        /**/
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
                        gap: clamp(8px, 1.6cqi, 14px);
                        align-items: center;
                        flex-shrink: 0;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-hh-cells,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-cells {
                        align-items: flex-end;
                    }

                    .bbgl-ach-hh-cell {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        min-width: 32px;
                    }

                    /**/
                    .bbgl-ach-hh-val {
                        font-family: var(--bbgl-ach-val-font);
                        font-variant-numeric: tabular-nums;
                        color: #eaeaea;
                        font-weight: 500;
                        font-size: clamp(11px, 2.05cqi, 13px);
                        white-space: nowrap;
                        line-height: 1.15;
                    }

                    .bbgl-ach-hh-tag {
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(8px, 1.4cqi, 10px);
                        font-weight: 700;
                        letter-spacing: .04em;
                        text-transform: uppercase;
                        line-height: 1.2;
                        margin-top: 1px;
                    }

                    .bbgl-ach-hh-tag.ach-stat-str {
                        color: #3264c6;
                    }

                    .bbgl-ach-hh-tag.ach-stat-def {
                        color: #dc3912;
                    }

                    /**/
                    .bbgl-ach-hh-tag.ach-stat-spd {
                        color: #ff9900;
                    }

                    .bbgl-ach-hh-tag.ach-stat-dex {
                        color: #109618;
                    }

                    /**/
                    .bbgl-ach-hh-tag.ach-stat-tot {
                        color: #999;
                    }

                    .bbgl-ach-hh-date-line {
                        font-family: var(--bbgl-ach-val-font);
                        color: #888;
                        line-height: 1.2;
                        font-variant-numeric: tabular-nums;
                        font-size: clamp(10px, 1.8cqi, 11.5px);
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-hh-date-line,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-date-line {
                        margin-top: 1px;
                    }

                    .bbgl-ach-hh-cell-total {
                        flex-direction: row;
                        align-items: baseline;
                        gap: 4px;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-hh-cell-total,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-cell-total {
                        flex-direction: column;
                        align-items: center;
                        /**/
                        gap: 0;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-hh-cell-total .bbgl-ach-hh-tag,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-cell-total .bbgl-ach-hh-tag {
                        order: 1;
                    }

                    .bbgl-ach-hh-time {
                        display: none;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-hh-time,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-time {
                        display: inline;
                    }

                    .bbgl-ach-hh-cell-stat {
                        display: none;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-hh-cell-stat,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-cell-stat {
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
                    #bbgl-exp-bar-wrapper {
                        position: relative;
                        width: 100%;
                        height: 0; /* Takes no layout space to avoid lifting header or squishing grid */
                        z-index: 20;
                    }
                    .bbgl-tube-layer {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 30px;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-end;
                        align-items: center;
                    }
                    .bbgl-tube-layer.bbgl-fill {
                        /* Vertical fill clip-path */
                        clip-path: polygon(0 100%, 100% 100%, 100% calc(100% - var(--exp-pct)), 0 calc(100% - var(--exp-pct)));
                        z-index: 2;
                    }
                    .bbgl-tube-layer.bbgl-text {
                        z-index: 3;
                        pointer-events: none;
                    }

                    .bbgl-exp-level {
                        border-radius: 50% 50% 0 0;
                        width: 60px;
                        height: 18px;
                        position: relative;
                    }
                    .bbgl-exp-track {
                        width: 100%;
                        height: 12px;
                        position: relative;
                        -webkit-mask-image: linear-gradient(to right, black calc(50% - 30px), transparent calc(50% - 30px), transparent calc(50% + 30px), black calc(50% + 30px));
                        mask-image: linear-gradient(to right, black calc(50% - 30px), transparent calc(50% - 30px), transparent calc(50% + 30px), black calc(50% + 30px));
                    }

                    .bbgl-exp-level::before, .bbgl-exp-level::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        width: 12px;
                        height: 12px;
                    }
                    .bbgl-exp-level::before {
                        right: 100%;
                        -webkit-mask-image: radial-gradient(circle at top left, transparent 11.5px, black 12px);
                        mask-image: radial-gradient(circle at top left, transparent 11.5px, black 12px);
                    }
                    .bbgl-exp-level::after {
                        left: 100%;
                        -webkit-mask-image: radial-gradient(circle at top right, transparent 11.5px, black 12px);
                        mask-image: radial-gradient(circle at top right, transparent 11.5px, black 12px);
                    }

                    /* EMPTY STATE */
                    .bbgl-empty .bbgl-exp-level, .bbgl-empty .bbgl-exp-level::before, .bbgl-empty .bbgl-exp-level::after {
                        background: linear-gradient(to top, rgba(140, 60, 200, 0.3), rgba(140, 60, 200, 0.15));
                        backdrop-filter: blur(1.5px) saturate(180%) contrast(120%) brightness(110%);
                        -webkit-backdrop-filter: blur(1.5px) saturate(180%) contrast(120%) brightness(110%);
                    }
                    .bbgl-empty .bbgl-exp-track {
                        background: linear-gradient(to top, rgba(140, 60, 200, 0.45), rgba(140, 60, 200, 0.3));
                        backdrop-filter: blur(1.5px) saturate(180%) contrast(120%) brightness(110%);
                        -webkit-backdrop-filter: blur(1.5px) saturate(180%) contrast(120%) brightness(110%);
                    }

                    .bbgl-empty .bbgl-exp-level {
                        border-top: 1.5px solid rgba(255, 255, 255, 0.5);
                        border-left: 1.5px solid rgba(255, 255, 255, 0.5);
                        border-right: 1.5px solid rgba(255, 255, 255, 0.5);
                    }
                    .bbgl-empty .bbgl-exp-track {
                        border-top: 1.5px solid rgba(255, 255, 255, 0.5);
                        border-bottom: 1.5px solid rgba(255, 255, 255, 0.2);
                    }

                    /* FILL STATE */
                    .bbgl-fill .bbgl-exp-level, .bbgl-fill .bbgl-exp-level::before, .bbgl-fill .bbgl-exp-level::after {
                        background: linear-gradient(to top, #3f145c, #e6ccff);
                    }
                    .bbgl-fill .bbgl-exp-track {
                        background: linear-gradient(to top, #1c0529, #3f145c);
                    }
                    .bbgl-fill .bbgl-exp-level {
                        border-top: 1.5px solid rgba(255, 255, 255, 0.8);
                        border-left: 1.5px solid rgba(255, 255, 255, 0.8);
                        border-right: 1.5px solid rgba(255, 255, 255, 0.8);
                    }
                    .bbgl-fill .bbgl-exp-track {
                        border-top: 1.5px solid rgba(255, 255, 255, 0.8);
                        border-bottom: 1.5px solid rgba(255, 255, 255, 0.4);
                    }

                    .bbgl-text .bbgl-exp-level {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 11px;
                        font-weight: 700;
                        text-shadow: 1px 1px 1px rgba(0,0,0,0.8), 0 0 4px #8c3cc8, 0 0 8px #8c3cc8;
                        background: none !important;
                        border: none !important;
                        backdrop-filter: none !important;
                        -webkit-backdrop-filter: none !important;
                    }
                    .bbgl-text .bbgl-text-spacer {
                        width: 100%;
                        height: 12px;
                    }
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
            link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;700&family=Fjalla+One&family=Inconsolata:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;700&family=VT323&display=swap';
            root.appendChild(link);
        }
        const style = document.createElement('style');
        style.id = 'bbgl-styles';
        style.textContent = CSS_STYLES;
        root.appendChild(style);
    }

    function injectApiCounter() {
        if (document.getElementById('bbgl-api-hud')) return;
        const hud = document.createElement('div');
        hud.id = 'bbgl-api-hud';
        hud.innerHTML = `API Calls: ${runtime.apiCallTotal}`;
        hud.style.display = 'none';
        document.body.appendChild(hud);
        dom.apiHud = hud;
    }

    function syncDevModeUI() {
        const mode = runtime.devMode;
        if (mode) {
            injectApiCounter();
            if (dom.apiHud) dom.apiHud.style.display = 'block';
        } else {
            if (dom.apiHud) dom.apiHud.style.display = 'none';
        }
        const btn = document.getElementById('dev-reset-btn');
        if (btn) btn.style.display = mode ? 'block' : 'none';
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
        dom.ledgerView = root.querySelector('#bbgl-ledger-view');
        dom.graphContainer = root.querySelector('#bbgl-graph-container');
        dom.graphSvg = root.querySelector('#bbgl-graph-svg');
        dom.calContainer = root.querySelector('#bbgl-cal-container');
        dom.tallToggle = root.querySelector('#bbgl-tall-toggle');
        dom.copyBtn = root.querySelector('#bbgl-copy-btn');
        dom.itemCounters = root.querySelector('#bbgl-item-counters');
        dom.popBtn = root.querySelector('#bbgl-pop-btn');
        dom.monthTrigger = root.querySelector('#month-trigger');
        dom.yearTrigger = root.querySelector('#year-trigger');
        dom.monthDropdown = root.querySelector('#bbgl-month-dropdown');
        dom.yearDropdown = root.querySelector('#bbgl-year-dropdown');
        dom.achievementsContainer = root.querySelector('#bbgl-achievements-container');
        dom.achievementsToggle = root.querySelector('#bbgl-achievements-toggle');
        dom.stickerGrid = root.querySelector('#bbgl-sticker-grid');
        dom.stickerPagination = root.querySelector('#bbgl-sticker-pagination');
        dom.stickerTitle = root.querySelector('#bbgl-sticker-title');
        dom.stickerPrev = root.querySelector('#sticker-prev-btn');
        dom.stickerNext = root.querySelector('#sticker-next-btn');
        dom.stickerSponsor = root.querySelector('#sticker-sponsor-btn');
        dom.stickerContainer = root.querySelector('#bbgl-sticker-container');
        dom.stickerBg = root.querySelector('#bbgl-sticker-bg');
        dom.viPedestal = root.querySelector('#vi-pedestal-wrapper');
        dom.viObj = root.querySelector('#vi-obj-target');
        dom.viName = root.querySelector('#vi-name-target');
        dom.refreshBtn = root.querySelector('#refresh-log-btn');
        dom.contentWrapper = root.querySelector('#bbgl-content-wrapper');
        if (!dom.apiHud) dom.apiHud = document.getElementById('bbgl-api-hud');
        if (!dom.gymTab) dom.gymTab = document.getElementById('bbgl-gym-tab');
    }

