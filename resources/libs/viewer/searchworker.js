
function getGlobal() {
    return (typeof window !== "undefined" && window !== null)
            ? window
            : (typeof self !== "undefined" && self !== null)
                ? self
                : global;
}

/**
 * Create namespace
 * @param {string} s - namespace (e.g. 'Autodesk.Viewing')
 * @return {Object} namespace
 */
var AutodeskNamespace = function (s) {
    var ns = getGlobal();

    var parts = s.split('.');
    for (var i = 0; i < parts.length; ++i) {
        ns[parts[i]] = ns[parts[i]] || {};
        ns = ns[parts[i]];
    }

    return ns;
};

// Define the most often used ones
AutodeskNamespace("Autodesk.Viewing.Private");

AutodeskNamespace("Autodesk.Viewing.Extensions");

AutodeskNamespace("Autodesk.Viewing.Shaders");

AutodeskNamespace('Autodesk.Viewing.UI');

AutodeskNamespace('Autodesk.LMVTK');

Autodesk.Viewing.getGlobal = getGlobal;
Autodesk.Viewing.AutodeskNamespace = AutodeskNamespace;


function getGlobal() {
    return (typeof window !== "undefined" && window !== null)
            ? window
            : (typeof self !== "undefined" && self !== null)
                ? self
                : global;
}

var av = Autodesk.Viewing,
    avp = av.Private;

av.getGlobal = getGlobal;

var isBrowser = av.isBrowser = (typeof navigator !== "undefined");

var isIE11 = av.isIE11 = isBrowser && !!navigator.userAgent.match(/Trident\/7\./);

// fix IE events
if(typeof window !== "undefined" && isIE11){
    (function () {
        function CustomEvent ( event, params ) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent( 'CustomEvent' );
            evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
            return evt;
        };

        CustomEvent.prototype = window.CustomEvent.prototype;

        window.CustomEvent = CustomEvent;
    })();
}

// IE does not implement ArrayBuffer slice. Handy!
if (!ArrayBuffer.prototype.slice) {
    ArrayBuffer.prototype.slice = function(start, end) {
        // Normalize start/end values
        if (!end || end > this.byteLength) {
            end = this.byteLength;
        }
        else if (end < 0) {
            end = this.byteLength + end;
            if (end < 0) end = 0;
        }
        if (start < 0) {
            start = this.byteLength + start;
            if (start < 0) start = 0;
        }

        if (end <= start) {
            return new ArrayBuffer();
        }

        // Bytewise copy- this will not be fast, but what choice do we have?
        var len = end - start;
        var view = new Uint8Array(this, start, len);
        var out = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            out[i] = view[i];
        }
        return out.buffer;
    }
}

// IE doesn't implement Math.log2
(function(){
    Math.log2 = Math.log2 || function(x) {
        return Math.log(x) / Math.LN2;
    };
})();

//The BlobBuilder object
if (typeof window !== "undefined")
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;


// Launch full screen on the given element with the available method
var launchFullscreen = av.launchFullscreen = function(element, options) {
    if (element.requestFullscreen) {
        element.requestFullscreen(options);
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen(options);
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(options);
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen(options);
    }
}

// Exit full screen with the available method
var exitFullscreen = av.exitFullscreen = function() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Determines if the browser is in full screen
var inFullscreen = av.inFullscreen = function(){

    // Special case for Ms-Edge that has webkitIsFullScreen with correct value
    // and fullscreenEnabled with wrong value (thanks MS)
    if ("webkitIsFullScreen" in document) return document.webkitIsFullScreen;
    return !!(document.mozFullScreenElement ||
        document.msFullscreenElement ||
        document.fullscreenEnabled || // Check last-ish because it is true in Ms-Edge
        document.querySelector(".viewer-fill-browser")); // Fallback for iPad
}

var fullscreenElement = av.fullscreenElement = function() {
    return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
}

var isFullscreenAvailable = av.isFullscreenAvailable = function(element) {
    return element.requestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
}

// Get the version of the android device through user agent.
// Return the version string of android device, e.g. 4.4, 5.0...
var getAndroidVersion = av.getAndroidVersion = function(ua) {
    var ua = ua || navigator.userAgent;
    var match = ua.match(/Android\s([0-9\.]*)/);
    return match ? match[1] : false;
};

// Determine if this is a touch or notouch device.
var isTouchDevice = av.isTouchDevice = function() {
    /*
    // Temporarily disable touch support through hammer on Android 5, to debug
    // some specific gesture issue with Chromium WebView when loading viewer3D.js.
    if (parseInt(getAndroidVersion()) == 5) {
        return false;
    }
    */

    return (typeof window !== "undefined" &&  "ontouchstart" in window);
}

av.isIOSDevice = function() {
    if (!isBrowser) return false;
    return /ip(ad|hone|od)/.test(navigator.userAgent.toLowerCase());
};

av.isAndroidDevice = function() {
    if (!isBrowser) return false;
    return (navigator.userAgent.toLowerCase().indexOf('android') !== -1);
};

av.isMobileDevice = function() {
    if (!isBrowser) return false;
    return av.isIOSDevice() || av.isAndroidDevice();
};

av.isSafari = function() {
    if (!isBrowser) return false;
    var _ua = navigator.userAgent.toLowerCase();
    return (_ua.indexOf("safari") !== -1) && (_ua.indexOf("chrome") === -1);
};

av.isFirefox = function() {
    if (!isBrowser) return false;
    var _ua = navigator.userAgent.toLowerCase();
    return (_ua.indexOf("firefox") !== -1);
};

av.isMac = function() {
    if (!isBrowser) return false;
    var _ua = navigator.userAgent.toLowerCase();
    return  (_ua.indexOf("mac os") !== -1);
};

av.isWindows = function() {
    if (!isBrowser) return false;
    var _ua = navigator.userAgent.toLowerCase();
    return  (_ua.indexOf("win32") !== -1 || _ua.indexOf("windows") !== -1);
};

/**
 * Detects if WebGL is enabled.
 *
 * @return { number } -1 for not Supported,
 *                    0 for disabled
 *                    1 for enabled
 */
var detectWebGL = av.detectWebGL = function()
{
    // Check for the webgl rendering context
    if ( !! window.WebGLRenderingContext) {
        var canvas = document.createElement("canvas"),
            names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
            context = false;

        for (var i = 0; i < 4; i++) {
            try {
                context = canvas.getContext(names[i]);
                context = rescueFromPolymer(context);
                if (context && typeof context.getParameter === "function") {
                    // WebGL is enabled.
                    //
                    return 1;
                }
            } catch (e) {}
        }

        // WebGL is supported, but disabled.
        //
        return 0;
    }

    // WebGL not supported.
    //
    return -1;
};


// Convert touchstart event to click to remove the delay between the touch and
// the click event which is sent after touchstart with about 300ms deley.
// Should be used in UI elements on touch devices.
var touchStartToClick = av.touchStartToClick = function(e) {
    e.preventDefault();  // Stops the firing of delayed click event.
    e.stopPropagation();
    e.target.click();    // Maps to immediate click.
};

//Safari doesn't have the Performance object
//We only need the now() function, so that's easy to emulate.
(function() {
    var global = getGlobal();
    if (!global.performance)
        global.performance = Date;
})();



//This file is the first one when creating minified build
//and is used to set certain flags that are needed
//for the concatenated build.

var av = Autodesk.Viewing;
var avp = Autodesk.Viewing.Private;

//avp.IS_CONCAT_BUILD = true; // Debugging source files without concatenation is no longer supported

/** @define {string} */
avp.BUILD_LMV_WORKER_URL = "lmvworker.js";
avp.LMV_WORKER_URL = avp.BUILD_LMV_WORKER_URL;

avp.ENABLE_DEBUG = avp.ENABLE_DEBUG || false;
avp.ENABLE_TRACE = avp.ENABLE_TRACE || false;
//avp.DEBUG_SHADERS = avp.DEBUG_SHADERS || false; // will be moved to wgs.js
avp.ENABLE_INLINE_WORKER = true;


(function() {

"use strict";

var av = Autodesk.Viewing;
var avp = Autodesk.Viewing.Private;

/**
 * Logging levels. Higher number means more verbose logs,
 * for example, with level 3, `info`, `warn`, or `error`
 * logs will show up in the console but `debug` and `log` won't.
 *
 * Semantics of specific levels:
 *  - debug: low-level debugging logs
 *  - log: common, higher-level debugging logs
 *  - info: helpful runtime information (even for stag/prod environments)
 *  - warn: potentially problematic situations; handled exceptions
 *  - error: definitely problematic situations; unhandled exceptions
 * @readonly
 * @enum {number}
 */
avp.LogLevels = {
    DEBUG: 5,
    LOG: 4,
    INFO: 3,
    WARNING: 2,
    ERROR: 1,
    NONE: 0
};

function Logger() {
    this.adp = null;
    this.runtimeStats = {};
    this.level = -1;
    this.setLevel(avp.ENABLE_TRACE ? avp.LogLevels.DEBUG : avp.LogLevels.ERROR);
}

Logger.prototype.initialize = function(options) {

    if (options.eventCallback)
        this.callback = options.eventCallback;

    this.sessionId = options.sessionId;
    if (!this.sessionId) {
        var now = Date.now() + "";
        this.sessionId = parseFloat(((Math.random() * 10000) | 0) + "" + now.substring(4));
    }

    this.environmentInfo = {
        touch: av.isTouchDevice(),
        env: avp.env,
        referer: getReferer(),
        version: LMV_VIEWER_VERSION,
        patch: LMV_VIEWER_PATCH,
        build_type: LMV_BUILD_TYPE
    };

    //Kick off with a viewer start event
    var startEvent = {
        category: "viewer_start",
        touch: this.environmentInfo.touch,
        env: this.environmentInfo.env,
        referer: this.environmentInfo.referer,
        version: this.environmentInfo.version,
        patch: this.environmentInfo.patch,
        build_type: this.environmentInfo.build_type
    };
    this.track(startEvent);

    var _this = this;
    this.interval = setInterval(function() {
        _this.reportRuntimeStats();
    }, 60000);
};

Logger.prototype.shutdown = function() {
    clearInterval(this.interval);
    this.interval = undefined;
};

Logger.prototype.track = function (entry) {
    this.updateRuntimeStats(entry);

    if (avp.offline || !this.sessionId) {
        return;
    }

    entry.timestamp = Date.now();
    entry.sessionId = this.sessionId;

    var sent = this.logToADP(entry);

    if (this.callback) {
        this.callback(entry, {
            adp: sent
        });
    }
};

Logger.prototype.logToADP = function(entry) {
    if (!this.adp) {
        return false;
    }

    // Map & log legacy events to ADP
    // TODO: move away from the legacy naming and avoid the awkward switch below
    var evType = '';
    var opType = '';
    switch (entry.category) {
        case 'tool_changed':
        case 'pref_changed':
            evType = 'CLICK_OPERATION';
            opType = entry.category + '/' + entry.name;
            break;
        case 'screen_mode':
            evType = 'CLICK_OPERATION';
            opType = 'pref_changed/' + entry.category;
            break;
        case 'metadata_load_stats':
            evType = 'DOCUMENT_START';
            opType = 'stats';
            entry.full_url = getReferer();
            break;
        case 'model_load_stats':
            evType = 'DOCUMENT_FULL';
            opType = 'stats';
            break;
        case 'error':
            evType = 'BACKGROUND_CALL';
            opType = 'error';
            break;
    }

    if (!evType)
        return false;

    this.adp.trackEvent(evType, {
        operation: {
            id: entry.sessionId,
            type: opType,
            stage: '',
            status: 'C',
            meta: entry
        }
    });
    return true;
};

Logger.prototype.updateRuntimeStats = function(entry) {
    if (entry.hasOwnProperty('aggregate')) {
        switch (entry.aggregate) {
            case 'count':
                if (this.runtimeStats[entry.name] > 0) {
                    this.runtimeStats[entry.name]++;
                } else {
                    this.runtimeStats[entry.name] = 1;
                }
                this.runtimeStats._nonempty = true;
                break;
            case 'last':
                this.runtimeStats[entry.name] = entry.value;
                this.runtimeStats._nonempty = true;
                break;
            default:
                this.warn('unknown log aggregate type');
        }
    }
};

Logger.prototype.reportRuntimeStats = function() {
    if (this.runtimeStats._nonempty) {
        delete this.runtimeStats._nonempty;

        if (this.adp) {
            this.adp.trackEvent('BACKGROUND_CALL', {
                operation: {
                    id: this.sessionId,
                    type: 'stats',
                    stage: '',
                    status: 'C',
                    meta: this.runtimeStats
                }
            });
        }

        this.runtimeStats.category = 'misc_stats';
        this.track(this.runtimeStats);
        this.runtimeStats = {};
    }
};

Logger.prototype.setLevel = function(level) {
    if (this.level === level)
        return;

    this.level = level;

    var nullFn = function(){};
    var avpl = avp.LogLevels;

    // Bind to console
    this.debug = level >= avpl.DEBUG   ? console.log.bind(console) : nullFn;
    this.log   = level >= avpl.LOG     ? console.log.bind(console)   : nullFn;
    this.info  = level >= avpl.INFO    ? console.info.bind(console)  : nullFn;
    this.warn  = level >= avpl.WARNING ? console.warn.bind(console)  : nullFn;
    this.error = level >= avpl.ERROR   ? console.error.bind(console) : nullFn;
};

/**
 * @private
 */
function getReferer(){
    // Wrapping href retrieval due to Fortify complains
    if (typeof window !== 'undefined') {
        return encodeURI(window.location.href);
    }
    return '';
}

Autodesk.Viewing.Private.logger = new Logger();

})();

/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */(function() {'use strict';function n(e){throw e;}var p=void 0,aa=this;function r(e,c){var d=e.split("."),b=aa;!(d[0]in b)&&b.execScript&&b.execScript("var "+d[0]);for(var a;d.length&&(a=d.shift());)!d.length&&c!==p?b[a]=c:b=b[a]?b[a]:b[a]={}};var u="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array;new (u?Uint8Array:Array)(256);var v;for(v=0;256>v;++v)for(var w=v,ba=7,w=w>>>1;w;w>>>=1)--ba;function x(e,c,d){var b,a="number"===typeof c?c:c=0,f="number"===typeof d?d:e.length;b=-1;for(a=f&7;a--;++c)b=b>>>8^y[(b^e[c])&255];for(a=f>>3;a--;c+=8)b=b>>>8^y[(b^e[c])&255],b=b>>>8^y[(b^e[c+1])&255],b=b>>>8^y[(b^e[c+2])&255],b=b>>>8^y[(b^e[c+3])&255],b=b>>>8^y[(b^e[c+4])&255],b=b>>>8^y[(b^e[c+5])&255],b=b>>>8^y[(b^e[c+6])&255],b=b>>>8^y[(b^e[c+7])&255];return(b^4294967295)>>>0}
var z=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,
2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,
2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,
2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,
3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,
936918E3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],y=u?new Uint32Array(z):z;function A(){}A.prototype.getName=function(){return this.name};A.prototype.getData=function(){return this.data};A.prototype.G=function(){return this.H};r("Zlib.GunzipMember",A);r("Zlib.GunzipMember.prototype.getName",A.prototype.getName);r("Zlib.GunzipMember.prototype.getData",A.prototype.getData);r("Zlib.GunzipMember.prototype.getMtime",A.prototype.G);function C(e){var c=e.length,d=0,b=Number.POSITIVE_INFINITY,a,f,g,k,m,q,t,h,l;for(h=0;h<c;++h)e[h]>d&&(d=e[h]),e[h]<b&&(b=e[h]);a=1<<d;f=new (u?Uint32Array:Array)(a);g=1;k=0;for(m=2;g<=d;){for(h=0;h<c;++h)if(e[h]===g){q=0;t=k;for(l=0;l<g;++l)q=q<<1|t&1,t>>=1;for(l=q;l<a;l+=m)f[l]=g<<16|h;++k}++g;k<<=1;m<<=1}return[f,d,b]};var D=[],E;for(E=0;288>E;E++)switch(!0){case 143>=E:D.push([E+48,8]);break;case 255>=E:D.push([E-144+400,9]);break;case 279>=E:D.push([E-256+0,7]);break;case 287>=E:D.push([E-280+192,8]);break;default:n("invalid literal: "+E)}
var ca=function(){function e(a){switch(!0){case 3===a:return[257,a-3,0];case 4===a:return[258,a-4,0];case 5===a:return[259,a-5,0];case 6===a:return[260,a-6,0];case 7===a:return[261,a-7,0];case 8===a:return[262,a-8,0];case 9===a:return[263,a-9,0];case 10===a:return[264,a-10,0];case 12>=a:return[265,a-11,1];case 14>=a:return[266,a-13,1];case 16>=a:return[267,a-15,1];case 18>=a:return[268,a-17,1];case 22>=a:return[269,a-19,2];case 26>=a:return[270,a-23,2];case 30>=a:return[271,a-27,2];case 34>=a:return[272,
a-31,2];case 42>=a:return[273,a-35,3];case 50>=a:return[274,a-43,3];case 58>=a:return[275,a-51,3];case 66>=a:return[276,a-59,3];case 82>=a:return[277,a-67,4];case 98>=a:return[278,a-83,4];case 114>=a:return[279,a-99,4];case 130>=a:return[280,a-115,4];case 162>=a:return[281,a-131,5];case 194>=a:return[282,a-163,5];case 226>=a:return[283,a-195,5];case 257>=a:return[284,a-227,5];case 258===a:return[285,a-258,0];default:n("invalid length: "+a)}}var c=[],d,b;for(d=3;258>=d;d++)b=e(d),c[d]=b[2]<<24|b[1]<<
16|b[0];return c}();u&&new Uint32Array(ca);function G(e,c){this.i=[];this.j=32768;this.d=this.f=this.c=this.n=0;this.input=u?new Uint8Array(e):e;this.o=!1;this.k=H;this.w=!1;if(c||!(c={}))c.index&&(this.c=c.index),c.bufferSize&&(this.j=c.bufferSize),c.bufferType&&(this.k=c.bufferType),c.resize&&(this.w=c.resize);switch(this.k){case I:this.a=32768;this.b=new (u?Uint8Array:Array)(32768+this.j+258);break;case H:this.a=0;this.b=new (u?Uint8Array:Array)(this.j);this.e=this.D;this.q=this.A;this.l=this.C;break;default:n(Error("invalid inflate mode"))}}
var I=0,H=1;
G.prototype.g=function(){for(;!this.o;){var e=J(this,3);e&1&&(this.o=!0);e>>>=1;switch(e){case 0:var c=this.input,d=this.c,b=this.b,a=this.a,f=p,g=p,k=p,m=b.length,q=p;this.d=this.f=0;f=c[d++];f===p&&n(Error("invalid uncompressed block header: LEN (first byte)"));g=f;f=c[d++];f===p&&n(Error("invalid uncompressed block header: LEN (second byte)"));g|=f<<8;f=c[d++];f===p&&n(Error("invalid uncompressed block header: NLEN (first byte)"));k=f;f=c[d++];f===p&&n(Error("invalid uncompressed block header: NLEN (second byte)"));k|=
f<<8;g===~k&&n(Error("invalid uncompressed block header: length verify"));d+g>c.length&&n(Error("input buffer is broken"));switch(this.k){case I:for(;a+g>b.length;){q=m-a;g-=q;if(u)b.set(c.subarray(d,d+q),a),a+=q,d+=q;else for(;q--;)b[a++]=c[d++];this.a=a;b=this.e();a=this.a}break;case H:for(;a+g>b.length;)b=this.e({t:2});break;default:n(Error("invalid inflate mode"))}if(u)b.set(c.subarray(d,d+g),a),a+=g,d+=g;else for(;g--;)b[a++]=c[d++];this.c=d;this.a=a;this.b=b;break;case 1:this.l(da,ea);break;
case 2:fa(this);break;default:n(Error("unknown BTYPE: "+e))}}return this.q()};
var K=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],L=u?new Uint16Array(K):K,N=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],O=u?new Uint16Array(N):N,P=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],Q=u?new Uint8Array(P):P,T=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],ga=u?new Uint16Array(T):T,ha=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,
13,13],U=u?new Uint8Array(ha):ha,V=new (u?Uint8Array:Array)(288),W,ia;W=0;for(ia=V.length;W<ia;++W)V[W]=143>=W?8:255>=W?9:279>=W?7:8;var da=C(V),X=new (u?Uint8Array:Array)(30),Y,ja;Y=0;for(ja=X.length;Y<ja;++Y)X[Y]=5;var ea=C(X);function J(e,c){for(var d=e.f,b=e.d,a=e.input,f=e.c,g;b<c;)g=a[f++],g===p&&n(Error("input buffer is broken")),d|=g<<b,b+=8;g=d&(1<<c)-1;e.f=d>>>c;e.d=b-c;e.c=f;return g}
function Z(e,c){for(var d=e.f,b=e.d,a=e.input,f=e.c,g=c[0],k=c[1],m,q,t;b<k;){m=a[f++];if(m===p)break;d|=m<<b;b+=8}q=g[d&(1<<k)-1];t=q>>>16;e.f=d>>t;e.d=b-t;e.c=f;return q&65535}
function fa(e){function c(a,c,b){var d,e,f,g;for(g=0;g<a;)switch(d=Z(this,c),d){case 16:for(f=3+J(this,2);f--;)b[g++]=e;break;case 17:for(f=3+J(this,3);f--;)b[g++]=0;e=0;break;case 18:for(f=11+J(this,7);f--;)b[g++]=0;e=0;break;default:e=b[g++]=d}return b}var d=J(e,5)+257,b=J(e,5)+1,a=J(e,4)+4,f=new (u?Uint8Array:Array)(L.length),g,k,m,q;for(q=0;q<a;++q)f[L[q]]=J(e,3);g=C(f);k=new (u?Uint8Array:Array)(d);m=new (u?Uint8Array:Array)(b);e.l(C(c.call(e,d,g,k)),C(c.call(e,b,g,m)))}
G.prototype.l=function(e,c){var d=this.b,b=this.a;this.r=e;for(var a=d.length-258,f,g,k,m;256!==(f=Z(this,e));)if(256>f)b>=a&&(this.a=b,d=this.e(),b=this.a),d[b++]=f;else{g=f-257;m=O[g];0<Q[g]&&(m+=J(this,Q[g]));f=Z(this,c);k=ga[f];0<U[f]&&(k+=J(this,U[f]));b>=a&&(this.a=b,d=this.e(),b=this.a);for(;m--;)d[b]=d[b++-k]}for(;8<=this.d;)this.d-=8,this.c--;this.a=b};
G.prototype.C=function(e,c){var d=this.b,b=this.a;this.r=e;for(var a=d.length,f,g,k,m;256!==(f=Z(this,e));)if(256>f)b>=a&&(d=this.e(),a=d.length),d[b++]=f;else{g=f-257;m=O[g];0<Q[g]&&(m+=J(this,Q[g]));f=Z(this,c);k=ga[f];0<U[f]&&(k+=J(this,U[f]));b+m>a&&(d=this.e(),a=d.length);for(;m--;)d[b]=d[b++-k]}for(;8<=this.d;)this.d-=8,this.c--;this.a=b};
G.prototype.e=function(){var e=new (u?Uint8Array:Array)(this.a-32768),c=this.a-32768,d,b,a=this.b;if(u)e.set(a.subarray(32768,e.length));else{d=0;for(b=e.length;d<b;++d)e[d]=a[d+32768]}this.i.push(e);this.n+=e.length;if(u)a.set(a.subarray(c,c+32768));else for(d=0;32768>d;++d)a[d]=a[c+d];this.a=32768;return a};
G.prototype.D=function(e){var c,d=this.input.length/this.c+1|0,b,a,f,g=this.input,k=this.b;e&&("number"===typeof e.t&&(d=e.t),"number"===typeof e.z&&(d+=e.z));2>d?(b=(g.length-this.c)/this.r[2],f=258*(b/2)|0,a=f<k.length?k.length+f:k.length<<1):a=k.length*d;u?(c=new Uint8Array(a),c.set(k)):c=k;return this.b=c};
G.prototype.q=function(){var e=0,c=this.b,d=this.i,b,a=new (u?Uint8Array:Array)(this.n+(this.a-32768)),f,g,k,m;if(0===d.length)return u?this.b.subarray(32768,this.a):this.b.slice(32768,this.a);f=0;for(g=d.length;f<g;++f){b=d[f];k=0;for(m=b.length;k<m;++k)a[e++]=b[k]}f=32768;for(g=this.a;f<g;++f)a[e++]=c[f];this.i=[];return this.buffer=a};
G.prototype.A=function(){var e,c=this.a;u?this.w?(e=new Uint8Array(c),e.set(this.b.subarray(0,c))):e=this.b.subarray(0,c):(this.b.length>c&&(this.b.length=c),e=this.b);return this.buffer=e};function $(e){this.input=e;this.c=0;this.m=[];this.s=!1}$.prototype.F=function(){this.s||this.g();return this.m.slice()};
$.prototype.g=function(){for(var e=this.input.length;this.c<e;){var c=new A,d=p,b=p,a=p,f=p,g=p,k=p,m=p,q=p,t=p,h=this.input,l=this.c;c.u=h[l++];c.v=h[l++];(31!==c.u||139!==c.v)&&n(Error("invalid file signature:"+c.u+","+c.v));c.p=h[l++];switch(c.p){case 8:break;default:n(Error("unknown compression method: "+c.p))}c.h=h[l++];q=h[l++]|h[l++]<<8|h[l++]<<16|h[l++]<<24;c.H=new Date(1E3*q);c.N=h[l++];c.M=h[l++];0<(c.h&4)&&(c.I=h[l++]|h[l++]<<8,l+=c.I);if(0<(c.h&8)){m=[];for(k=0;0<(g=h[l++]);)m[k++]=String.fromCharCode(g);
c.name=m.join("")}if(0<(c.h&16)){m=[];for(k=0;0<(g=h[l++]);)m[k++]=String.fromCharCode(g);c.J=m.join("")}0<(c.h&2)&&(c.B=x(h,0,l)&65535,c.B!==(h[l++]|h[l++]<<8)&&n(Error("invalid header crc16")));d=h[h.length-4]|h[h.length-3]<<8|h[h.length-2]<<16|h[h.length-1]<<24;h.length-l-4-4<512*d&&(f=d);b=new G(h,{index:l,bufferSize:f});c.data=a=b.g();l=b.c;c.K=t=(h[l++]|h[l++]<<8|h[l++]<<16|h[l++]<<24)>>>0;x(a,p,p)!==t&&n(Error("invalid CRC-32 checksum: 0x"+x(a,p,p).toString(16)+" / 0x"+t.toString(16)));c.L=
d=(h[l++]|h[l++]<<8|h[l++]<<16|h[l++]<<24)>>>0;(a.length&4294967295)!==d&&n(Error("invalid input size: "+(a.length&4294967295)+" / "+d));this.m.push(c);this.c=l}this.s=!0;var F=this.m,s,M,R=0,S=0,B;s=0;for(M=F.length;s<M;++s)S+=F[s].data.length;if(u){B=new Uint8Array(S);for(s=0;s<M;++s)B.set(F[s].data,R),R+=F[s].data.length}else{B=[];for(s=0;s<M;++s)B[s]=F[s].data;B=Array.prototype.concat.apply([],B)}return B};r("Zlib.Gunzip",$);r("Zlib.Gunzip.prototype.decompress",$.prototype.g);r("Zlib.Gunzip.prototype.getMembers",$.prototype.F);}).call(this);


(function() {

    "use strict";

    var av = Autodesk.Viewing,
        avp = av.Private;

    avp.inWorkerThread = (typeof self !== 'undefined') && (typeof window === 'undefined');

    var XhrConstructor;
    if (typeof XMLHttpRequest !== "undefined") {
        XhrConstructor = XMLHttpRequest;
    } else {
        //Node.js code path
        XhrConstructor = require("xhr2");

        //Patch xhr2 to allow Cookie headers so we can do auth against viewing.api.autodesk.com
        //by faking being a browser
        XhrConstructor.prototype._restrictedHeaders.cookie = false;
    }

    var ViewingService = {};

    var warnedGzip = false;

    // Simplify Unix style file path. For example, turn '/a/./b/../../c/' into "/c".
    // Required to deal with OSS crappy URNs where there are embedded '..'.
    function simplifyPath(path) {

        var elements = path.split('/');
        if (elements.length == 0)
            return path;

        var stack = [];
        for (var index = 0; index < elements.length; ++index) {
            var c = elements[index];
            if (c === '.') {
                continue;
            }  if (c === '..' && stack.length) {
                stack.pop();
            } else {
                stack.push(c);
            }
        }

        // Great, the path commits suicide.
        if (stack.length == 0)
            return '';

        return stack.join("/");
    }

    function textToArrayBuffer(textBuffer, startOffset) {
        var len = textBuffer.length - startOffset;
        var arrayBuffer = new ArrayBuffer(len);
        var ui8a = new Uint8Array(arrayBuffer, 0);
        for (var i = 0, j = startOffset; i < len; i++, j++)
            ui8a[i] = (textBuffer.charCodeAt(j) & 0xff);
        return ui8a;
    }


    ViewingService.OSS_PREFIX = "urn:adsk.objects:os.object:";

    ViewingService.getDirectOSSUrl = function(options, path) {
        // When we see a resource is hosted on OSS (by checking the urn prefix where it contain a specific signature),
        // we'll construct the full OSS url that can be used to call the OSS GET object API.
        // The construction process will extract the OSS bucket name (which is the payload between the signature and the first forward slash first enoutered afterwards),
        // and then the object name (which is the payload left). The object name has to be URL encoded because OSS will choke on forward slash.
        var ossIndex = path.indexOf(ViewingService.OSS_PREFIX);
        if (ossIndex !== -1) {
            var ossPath = path.substr(ossIndex + ViewingService.OSS_PREFIX.length);
            var bucket = ossPath.substr(0, ossPath.indexOf("/"));
            var object = ossPath.substr(ossPath.indexOf("/") + 1);
            object = simplifyPath(object);
            return av.makeOssPath(options.endpoint, bucket, object);
        }
    };

    /**
     * Construct full URL given a potentially partial viewing service "urn:" prefixed resource
     * @returns {string}
     */
    ViewingService.generateUrl = function (baseUrl, api, path) {

        path = simplifyPath(path);

        //Check if it's a viewing service item path
        //Public/static content will not have the urn: prefix.
        //So URL construction is a no-op
        if (decodeURIComponent(path).indexOf('urn:') !== 0)
            return path;

        //Remove "urn:" prefix when getting URN-based stuff (manifests and thumbnails)
        if (api !== 'items') {
            path = path.substr(4);
        }

        switch (api) {
            case "items": return av.getItemApi(baseUrl) + path;
            case "bubbles": return av.getManifestApi(baseUrl) + path;
            case "thumbnails": return av.getThumbnailApi(baseUrl) + path;
        }
    };

    function isRemotePath(baseUrl, path) {
        if (path.indexOf("file://") !== -1)
            return false;
        if (path.indexOf("://") !== -1)
            return true;
        if (baseUrl)
            return true;
    }

    function loadLocalFile(url, onSuccess, onFailure, options) {

        if (url.indexOf("file://") === 0)
            url = url.substr(7);

        function postProcess(data) {
            if (options.responseType == "json") {
                try {
                    return JSON.parse(data.toString("utf8"));
                } catch(e) {
                    onFailure(e);
                }
            }
            return data;
        }

        //Always use async on Node
        require('fs').readFile(url, function(error, data) {
            if (error) {
                onFailure(0,0,{httpStatusText:error, url:url});
            } else {
                if (data[0] == 31 && data[1] == 139) {
                    require('zlib').gunzip(data, null, function(error, data) {
                        if (error)
                            onFailure(0,0,{httpStatusText:error, url:url});
                        else {
                            data = postProcess(data);
                            if (options.ondata)
                                options.ondata(data);
                            onSuccess(data);
                        }
                    });
                } else {
                    data = postProcess(data);
                    if (options.ondata)
                        options.ondata(data);
                    onSuccess(data);
                 }
            }
        });
    }

    /**
     *  Performs a GET/HEAD request to Viewing Service.
     *
     * @param {string} viewingServiceBaseUrl - The base url for the viewing service.
     * @param {string} api - The api to call in the viewing service.
     *  @param {string} url - The url for the request.
     *  @param {function} onSuccess - A function that takes a single parameter that represents the response
     *                                returned if the request is successful.
     *  @param {function} onFailure - A function that takes an integer status code, and a string status, which together represent
     *                                the response returned if the request is unsuccessful, and a third data argument, which
     *                                has more information about the failure.  The data is a dictionary that minimally includes
     *                                the url, and an exception if one was raised.
     *  @param {Object=} [options] - A dictionary of options that can include:
     *                               headers - A dictionary representing the additional headers to add.
     *                               queryParams - A string representing the query parameters
     *                               responseType - A string representing the response type for this request.
     *                               {boolean} [encodeUrn] - when true, encodes the document urn if found.
     *                               {boolean} [noBody] - when true, will perform a HEAD request
     */
    ViewingService.rawGet = function (viewingServiceBaseUrl, api, url, onSuccess, onFailure, options) {

        var options = options ? options : {};

        //NODE
        if (av.isNodeJS && !isRemotePath(viewingServiceBaseUrl, url)) {
            loadLocalFile(url, onSuccess, onFailure, options);
            return;
        }

        //See if it can be mapped to a direct OSS path
        var ossUrl = ViewingService.getDirectOSSUrl(options, url);

        if (ossUrl)
            url = ossUrl;
        else
            url = ViewingService.generateUrl(viewingServiceBaseUrl, api, url);

        if (options.queryParams) {
            url = url + "?" + options.queryParams;
        }

        var request = new XhrConstructor();

        function onError(e) {
            if (onFailure)
                onFailure(request.status, request.statusText, {url: url});
        }

        function onLoad(e) {
            if (request.status === 200) {

                if (request.response
                    && request.response instanceof ArrayBuffer) {
                    var rawbuf = new Uint8Array(request.response);
                    // It's possible that if the Content-Encoding header is set,
                    // the browser unzips the file by itself, so let's check if it did.
                    // Return raw buffer if skip decompress is true
                    if (!options.skipDecompress && rawbuf[0] == 31 && rawbuf[1] == 139) {
                        if (!warnedGzip) {
                            warnedGzip = true;
                            avp.logger.warn("An LMV resource (" + url + ") was not uncompressed by the browser. This hurts performance. Check the Content-Encoding header returned by the server and check whether you're getting double-compressed streams. The warning prints only once but it's likely the problem affects multiple resources.");
                        }
                        try {
                            rawbuf = new Zlib.Gunzip(rawbuf).decompress();
                        } catch (err) {
                            onFailure(av.ErrorCodes.BAD_DATA,
                                      "Malformed data received when requesting file",
                                      { "url": url, "exception": err.toString(), "stack": err.stack });
                        }
                    }

                    onSuccess(rawbuf);
                }
                else {
                    onSuccess(request.response || request.responseText);
                }
            }
            else {
                onError(e);
            }
        }

        try {

            var async = options.hasOwnProperty('asynchronous') ? options.asynchronous : true;
            request.open(options.noBody ? 'HEAD' : 'GET', url, async);

            if (options.hasOwnProperty('responseType')) {
                request.responseType = options.responseType;
            }

            request.withCredentials = true;
            if (options.hasOwnProperty("withCredentials"))
                request.withCredentials = options.withCredentials;

            if (options.headers) {
                for (var header in options.headers) {
                    request.setRequestHeader(header, options.headers[header]);

                    // Disable withCredentials if header is Authorization type
                    // NOTE: using withCredentials attaches cookie data to request
                    if (header.toLocaleLowerCase() === "authorization") {
                        request.withCredentials = false;
                    }
                }
            }

            if (async) {
                request.onload = onLoad;
                request.onerror = onError;
                request.ontimeout = onError;

                if (options.ondata) {

                    //Set up incremental progress notification
                    //if needed. We have to do some magic in order
                    //to get the received data progressively.
                    //https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
                    request.overrideMimeType('text/plain; charset=x-user-defined');
                    options._dlProgress = {
                        streamOffset: 0,
                        counter: 0
                    };

                    request.onreadystatechange = function() {

                        if (request.readyState > 2) {

                            var textBuffer = request.responseText;

                            // No new data coming in.
                            if (options._dlProgress.streamOffset >= textBuffer.length)
                                return;

                            var arrayBuffer = textToArrayBuffer(textBuffer, options._dlProgress.streamOffset);

                            options._dlProgress.streamOffset = textBuffer.length;

                            options.ondata(arrayBuffer);
                        }
                    };
                }
            }

            request.send();

            if (options.skipAssetCallback) {
            } else {
                if (avp.inWorkerThread) {
                    self.postMessage({assetRequest: [url, options.headers, null /* ACM session id, null in this case. */]});
                } else {
                    avp.assets.push([url, options.headers, null /* ACM session id, null in this case. */]);
                }
            }

            if (!async) {
                onLoad();
            }
        }
        catch (e) {
            onFailure(request.status, request.statusText, {url: url, exception: e});
        }
    };


    // Create the default failure callback.
    //
    ViewingService.defaultFailureCallback = function (httpStatus, httpStatusText, data) {
        if (httpStatus == 403) {
            this.raiseError(
                av.ErrorCodes.NETWORK_ACCESS_DENIED,
                "Access denied to remote resource",
                { "url": data.url, "httpStatus": httpStatus, "httpStatusText": httpStatusText });
        }
        else if (httpStatus == 404) {
            this.raiseError(
                av.ErrorCodes.NETWORK_FILE_NOT_FOUND,
                "Remote resource not found",
                { "url": data.url, "httpStatus": httpStatus, "httpStatusText": httpStatusText });
        }
        else if (httpStatus >= 500 && httpStatus < 600) {
            this.raiseError(
                av.ErrorCodes.NETWORK_SERVER_ERROR,
                "Server error when accessing resource",
                { "url": data.url, "httpStatus": httpStatus, "httpStatusText": httpStatusText });
        }
        else if (data.exception) {
            this.raiseError(
                av.ErrorCodes.NETWORK_FAILURE,
                "Network failure",
                { "url": data.url, "exception": data.exception.toString(), "stack": data.exception.stack});
        }
        else {
            this.raiseError(
                av.ErrorCodes.NETWORK_UNHANDLED_RESPONSE_CODE,
                "Unhandled response code from server",
                { "url": data.url, "httpStatus": httpStatus, "httpStatusText": httpStatusText, data:data });
        }
    };



    function copyOptions(loadContext, options) {

        //Those are the usual defaults when called from the LMV worker
        if (!options.hasOwnProperty("asynchronous"))
            options.asynchronous = true;
        else if (!options.asynchronous)
            avp.logger.warn("LMV: Sync XHR used. Performance warning.");

        if (!options.hasOwnProperty("responseType"))
            options.responseType = "arraybuffer";

        //Add options junk we got from the main thread context
        options.withCredentials = !!loadContext.auth;
        options.headers = loadContext.headers;
        options.queryParams = loadContext.queryParams;
        options.endpoint = loadContext.endpoint;
    }

    //Utility function called from the web worker to set up the options for a get request,
    //then calling ViewingService.get internally
    ViewingService.getItem = function (loadContext, url, onSuccess, onFailure, options) {

        options = options || {};

        copyOptions(loadContext, options);

        // VIEWING V2 can only handle encoded URN
        var index1 = url.indexOf('urn:');
        var index2 = url.indexOf('?');
        if (index1 !== -1) {
            if (index2 !== -1) {
                url = url.substr(0, index1) + encodeURIComponent(url.substring(index1, index2)) + url.substr(index2);
            }
            else {
                url = url.substr(0, index1) + encodeURIComponent(url.substr(index1));
            }
        }

        ViewingService.rawGet(loadContext.endpoint, 'items', url, onSuccess, onFailure, options);

    };

    //Utility function called from the web worker to set up the options for a get request,
    //then calling ViewingService.get internally
    ViewingService.getManifest = function (loadContext, url, onSuccess, onFailure, options) {

        options = options || {};

        if (!options.hasOwnProperty("responseType"))
            options.responseType = "json";

        copyOptions(loadContext, options);

        ViewingService.rawGet(loadContext.endpoint, 'bubbles', url, onSuccess, onFailure, options);

    };

    //Utility function called from the web worker to set up the options for a get request,
    //then calling ViewingService.get internally
    ViewingService.getThumbnail = function (loadContext, url, onSuccess, onFailure, options) {

        options = options || {};

        copyOptions(loadContext, options);

        if (!options.queryParams) {
            var role = options.role || "rendered";
            var sz = options.size || 400;
            options.queryParams = "guid=" + encodeURIComponent(options.guid) + "&role=" + role + "&width=" + sz + "&height=" + sz;
        }

        ViewingService.rawGet(loadContext.endpoint, 'thumbnails', url, onSuccess, onFailure, options);

    };


    ViewingService.getACMSession = function (endpoint, acmProperties, onSuccess, onFailure) {

        var acmHeaders = {};
        var token;

        for (var key in acmProperties) {

            if (key === "oauth2AccessToken")
                token = acmProperties[key];

            else if (key.indexOf("x-ads-acm") !== -1)
                acmHeaders[key] = acmProperties[key];
                if (av.isMobileDevice()) av.HTTP_REQUEST_HEADERS = acmHeaders;
        }

        // The value of this can be anything. Required for some arcane reasons.
        acmHeaders.application = "autodesk";

        var xhr = new XMLHttpRequest();
        xhr.open("POST", endpoint + '/oss-ext/v2/acmsessions', true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.responseType = "json";

        xhr.onload = function () {
            if (xhr.status === 200 && xhr.response) {
                // If the response is a string (e.g. from IE), need to parse it to an object first
                var response = typeof(xhr.response) === 'string' ? JSON.parse(xhr.response) : xhr.response;

                if (response && response.acmsession) {
                    onSuccess(response.acmsession);
                }
                else {
                    onFailure(xhr.status, "Can't get acm session from response.");
                }

            } else {
                onFailure(xhr.status);
            }
        };

        xhr.onerror = onFailure;
        xhr.ontimeout = onFailure;
        xhr.send(JSON.stringify(acmHeaders));

        // "application" header is only required for OSS end point, and should not be passed
        // with normal requests because this header is not in allowed header sets of APIGEE.
        delete acmHeaders.application;

    };

    avp.ViewingService = ViewingService;

})();

(function() {

"use strict";

var lmv = Autodesk.LMVTK;

// http://www.onicos.com/staff/iz/amuse/javascript/expert/utf.txt
/* utf.js - UTF-8 <=> UTF-16 convertion
 *
 * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0
 * LastModified: Dec 25 1999
 * This library is free.  You can redistribute it and/or modify it.
 */
function utf8BlobToStr(array, start, length) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = length;
    i = 0;
    while(i < len) {
        c = array[start + i++];
        switch(c >> 4)
        {
          case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
          case 12: case 13:
            // 110x xxxx   10xx xxxx
            char2 = array[start + i++];
            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
            break;
          case 14:
            // 1110 xxxx  10xx xxxx  10xx xxxx
            char2 = array[start + i++];
            char3 = array[start + i++];
            out += String.fromCharCode(((c & 0x0F) << 12) |
                           ((char2 & 0x3F) << 6) |
                           ((char3 & 0x3F) << 0));
            break;
        }
    }

    return out;
}


function utf16to8(str, array, start) {
    var i, len, c;

    var j = start || 0;
    len = str.length;

    if (array) {
        for(i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                array[j++] = str.charAt(i);
            } else if (c > 0x07FF) {
                array[j++] = String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                array[j++] = String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
                array[j++] = String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
            } else {
                array[j++] = String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
                array[j++] = String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
            }
        }
    } else {
        //If no output buffer is passed in, estimate the required
        //buffer size and return that.
        for(i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                j++;
            } else if (c > 0x07FF) {
                j+=3;
            } else {
                j+=2;
            }
        }
    }

    return j - (start || 0);
}

var USE_MANUAL_UTF8 = true;

lmv.utf8ArrayToString = function(array, start, length) {

    if (start === undefined)
        start = 0;
    if (length === undefined)
        length = array.length;

    if (USE_MANUAL_UTF8) {
        return utf8BlobToStr(array, start, length);
    } else {
        var encodedString = "";
        for (var i=start, iEnd=start+length; i<iEnd; i++)
            encodedString += String.fromCharCode(array[i]);

        return decodeURIComponent(escape(encodedString));
    }
};

lmv.blobToJson = function(blob) {

    var decodedString = lmv.utf8ArrayToString(blob, 0, blob.length);

    return JSON.parse(decodedString);
};

//parses a piece of json from a given blob (representing an array of json values)
//up to the next comma+newline combo (i.e. array delimiter).
lmv.subBlobToJson = function(blob, startIndex) {
    if (startIndex === undefined) {
        return '';
    }

    var i = startIndex;

    while (i<blob.length-1) {
        var c = blob[i];
        if (c == 44 && (blob[i+1] == 10 || blob[i+1] == 13)) //comma followed by newline?
            break;
        if (c == 10 || c == 13) //detect newline or line feed
            break;
        i++;
    }

    var decodedString = lmv.utf8ArrayToString(blob, startIndex, i-startIndex);
    try {
        return JSON.parse(decodedString);
    } catch (e) {
        console.error("Error parsing property blob to JSON : " + decodedString);
        return decodedString;
    }
};

lmv.subBlobToJsonInt = function(blob, startIndex) {
    var val = 0;
    var i = startIndex;

    //Check for integers that were serialized as strings.
    //This should not happen, ever, but hey, it does.
    if (blob[i] == 34)
        i++;

    while (i<blob.length-1) {
        var c = blob[i];
        if (c == 44 && (blob[i+1] == 10 || blob[i+1] == 13))
            break;
        if (c == 10 || c == 13 || c == 34)
            break;
        if (c >= 48 && c <= 57)
            val = val * 10 + (c - 48);

        i++;
    }

    return val;
};

//Simple integer array parse -- expects the array in property database
//format, where the array is packed with possibly newline separator,
//but no other white space. Does not do extensive error checking
lmv.parseIntArray = function(blob, wantSentinel) {

    //find out how many items we have
    var count = 0;
    for (var i= 0, iEnd=blob.length; i<iEnd; i++)
        if (blob[i] == 44) //44 = ','
            count++;

    count++; //last item has no comma after it

    var items = new Uint32Array(count + (wantSentinel ? 1 : 0));

    i=0;
    var end = blob.length;

    while (blob[i] != 91 && i<end) //91 = '['
        i++;

    if (i == blob.length)
        return null;

    i++;

    var seenDigit = false;
    count = 0;
    var curInt = 0;
    while (i<end) {
        var c = blob[i];
        if (c >= 48 && c <= 57) { //digit
            curInt = 10 * curInt + (c - 48);
            seenDigit = true;
        }
        else if (c == 44 || c == 93) { //',' or ']'
            if (seenDigit) {
                items[count++] = curInt;
                seenDigit = false;
                curInt = 0;
            }
        } else {
            seenDigit = false; //most likely a newline (the only other thing we have in our arrays
            curInt = 0;
        }
        i++;
    }

    return items;
};

//Scans an array of json values (strings, integers, doubles) and finds the
//offset of each value in the array, so that we can later pick off that
//specific value, without parsing the whole (potentially huge) json array up front.
//This expects the input blob to be in the form serialized by the property database
//C++ component -- one value per line. A more sophisticated parser would be needed
//in case the format changes and this assumption is not true anymore.
lmv.findValueOffsets = function(blob) {

    //first, count how many items we have
    var count = 0;
    var end = blob.length-1;

    for (var i= 0; i<end; i++) {
        if ( blob[i] == 44 && (blob[i+1] == 10 || blob[i+1] == 13)) // ',' + newline is the item delimiter
            count++;
    }

    if (!count)
        return null;

    count++; //one for the last item

    var items = new Uint32Array(count);

    i=0;
    count = 0;

    //find opening [
    while (blob[i] != 91 && i<end) //91 = '['
        i++;

    i++;

    items[count++] = i;
    var seenEol = false;
    while (i<end) {
        if (blob[i] == 10 || blob[i] == 13)
            seenEol = true;
        else if (seenEol) {
            seenEol = false;
            items[count++] = i;
        }

        i++;
    }

    return items;
};



})();

(function() {

"use strict";

var lmv = Autodesk.LMVTK;

//We will use these shared memory arrays to
//convert from bytes to the desired data type.
var convBuf = new ArrayBuffer(8);
var convUint8 = new Uint8Array(convBuf);
var convUint16 = new Uint16Array(convBuf);
var convInt32 = new Int32Array(convBuf);
var convUint32 = new Uint32Array(convBuf);
var convFloat32 = new Float32Array(convBuf);
var convFloat64 = new Float64Array(convBuf);


/** @constructor */
function InputStream(buf) {
    this.buffer = buf;
    this.offset = 0;
    this.byteLength = buf.length;
}


InputStream.prototype.seek = function(off) {
    this.offset = off;
};

InputStream.prototype.getBytes = function(len) {
    var ret = new Uint8Array(this.buffer.buffer, this.offset, len);
    this.offset += len;
    return ret;
};

InputStream.prototype.getVarints = function () {
    var b;
    var value = 0;
    var shiftBy = 0;
    do {
        b = this.buffer[this.offset++];
        value |= (b & 0x7f) << shiftBy;
        shiftBy += 7;
    } while (b & 0x80);
    return value;
};

InputStream.prototype.getUint8 = function() {
    return this.buffer[this.offset++];
};

InputStream.prototype.getUint16 = function() {
    convUint8[0] = this.buffer[this.offset++];
    convUint8[1] = this.buffer[this.offset++];
    return convUint16[0];
};

InputStream.prototype.getInt16 = function() {
    var tmp = this.getUint16();
    //make negative integer if the ushort is negative
    if (tmp > 0x7fff)
        tmp = tmp | 0xffff0000;
    return tmp;
};

InputStream.prototype.getInt32 = function() {
    var src = this.buffer;
    var dst = convUint8;
    var off = this.offset;
    dst[0] = src[off];
    dst[1] = src[off+1];
    dst[2] = src[off+2];
    dst[3] = src[off+3];
    this.offset += 4;
    return convInt32[0];
};

InputStream.prototype.getUint32 = function() {
    var src = this.buffer;
    var dst = convUint8;
    var off = this.offset;
    dst[0] = src[off];
    dst[1] = src[off+1];
    dst[2] = src[off+2];
    dst[3] = src[off+3];
    this.offset += 4;
    return convUint32[0];
};

InputStream.prototype.getFloat32 = function() {
    var src = this.buffer;
    var dst = convUint8;
    var off = this.offset;
    dst[0] = src[off];
    dst[1] = src[off+1];
    dst[2] = src[off+2];
    dst[3] = src[off+3];
    this.offset += 4;
    return convFloat32[0];
};

//Specialized copy which copies 4 byte integers into 2-byte target.
//Used for downcasting OCTM int32 index buffers to int16 index buffers,
//in cases we know we don't need more (LMVTK guarantees 2 byte indices).
InputStream.prototype.getIndicesArray = function(buffer, offset, numItems) {

    var src = this.buffer;
    var dst = new Uint8Array(buffer, offset, numItems*2);
    var off = this.offset;

    for (var i= 0, iEnd=numItems*2; i<iEnd; i+=2) {
        dst[i] = src[off];
        dst[i+1] = src[off+1];
        off += 4;
    }

    this.offset = off;
};

InputStream.prototype.getVector3Array = function(arr, numItems, startOffset, stride) {
    var src = this.buffer;
    var off = this.offset;

    //We cannot use Float32Array copying here because the
    //source stream is out of alignment
    var dst = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);

    if (stride === 3 && startOffset === 0) {
        var len = numItems*12;
        dst.set(src.subarray(off, off+len));
        this.offset += len;
    } else {

        stride *= 4;
        var aoff = startOffset * 4;
        for (var i=0; i<numItems; i++) {
            for (var j=0; j<12; j++) {
                dst[aoff+j] = src[off++];
            }
            aoff += stride;
        }

        this.offset = off;
    }
};

InputStream.prototype.getVector2Array = function(arr, numItems, startOffset, stride) {
    var src = this.buffer;
    var dst = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    var off = this.offset;

    stride *= 4;
    var aoff = startOffset * 4;
    for (var i=0; i<numItems; i++) {
        for (var j=0; j<8; j++) {
            dst[aoff+j] = src[off++];
        }
        aoff += stride;
    }

    this.offset = off;
};

InputStream.prototype.getVector4 = function(arr, offset) {
    var src = this.buffer;
    var dst = convUint8;
    var off = this.offset;
    var conv = convFloat32;

    for (var j=0; j<4; j++) {
        dst[0] = src[off];
        dst[1] = src[off+1];
        dst[2] = src[off+2];
        dst[3] = src[off+3];
        arr[offset+j] = conv[0];
        off += 4;
    }

    this.offset = off;
};

InputStream.prototype.getFloat64 = function() {
    var src = this.buffer;
    var dst = convUint8;
    var off = this.offset;
    for (var i=0; i<8; i++)
        dst[i] = src[off+i];
    this.offset += 8;
    return convFloat64[0];
};



InputStream.prototype.getString = function(len) {
    var res = lmv.utf8ArrayToString(this.buffer, this.offset, len);
    this.offset += len;
    return res;
};

InputStream.prototype.reset = function (buf) {
    this.buffer = buf;
    this.offset = 0;
    this.byteLength = buf.length;
};

lmv.InputStream = InputStream;

})();

(function() {

"use strict";

var lmv = Autodesk.LMVTK;


lmv.VBUtils = {


    deduceUVRepetition: function(mesh) {

        for (var p in mesh.vblayout) {

            if (p.indexOf("uv") != 0 || p.indexOf("uvw") == 0)
                continue;

            var baseOffset = mesh.vblayout[p].offset;
            var floatStride = mesh.vbstride;
            var vbf = mesh.vb;
            var vcount = mesh.vb.length/floatStride;

            for (var i = 0, offset = baseOffset; i<vcount; i++, offset += floatStride)
            {
                var u = vbf[offset];
                var v = vbf[offset+1];
                if (u > 2 || u < 0 || v > 2 || v < 0) {
                    mesh.vblayout[p].isPattern = true;
                    break;
                }
            }
        }
    },


    //Calculate the 3D bounding box and bounding sphere
    //of a mesh containing an interleaved vertex buffer
    computeBounds3D : function(mesh) {

        var minx = Infinity, miny = Infinity, minz = Infinity;
        var maxx = -Infinity, maxy = -Infinity, maxz = -Infinity;
        var i, offset, x, y, z;

        var floatStride = mesh.vbstride;
        var baseOffset = mesh.vblayout.position.offset;
        var vbf = mesh.vb;
        var vcount = mesh.vb.length/floatStride;

        for (i = 0, offset = baseOffset; i<vcount; i++, offset += floatStride)
        {
            x = vbf[offset];
            y = vbf[offset+1];
            z = vbf[offset+2];

            if (minx > x) minx = x;
            if (miny > y) miny = y;
            if (minz > z) minz = z;

            if (maxx < x) maxx = x;
            if (maxy < y) maxy = y;
            if (maxz < z) maxz = z;
        }

        var bb = mesh.boundingBox = {
                min:{x:minx, y:miny, z:minz},
                max:{x:maxx, y:maxy, z:maxz}
        };

        var cx = 0.5*(minx + maxx), cy = 0.5*(miny + maxy), cz = 0.5*(minz + maxz);

        var bs = mesh.boundingSphere = {};
        bs.center = {x:cx, y:cy, z:cz};

        var maxRadiusSq = 0;
        for (i = 0, offset = baseOffset; i < vcount; i++, offset += floatStride) {

            x = vbf[offset];
            y = vbf[offset+1];
            z = vbf[offset+2];

            var dx = x - cx;
            var dy = y - cy;
            var dz = z - cz;
            var distsq = dx*dx + dy*dy + dz*dz;
            if (distsq > maxRadiusSq)
                maxRadiusSq = distsq;
        }

        bs.radius = Math.sqrt(maxRadiusSq);

    },

    bboxUnion : function(bdst, bsrc) {
        if (bsrc.min.x < bdst.min.x)
            bdst.min.x = bsrc.min.x;
        if (bsrc.min.y < bdst.min.y)
            bdst.min.y = bsrc.min.y;
        if (bsrc.min.z < bdst.min.z)
            bdst.min.z = bsrc.min.z;

        if (bsrc.max.x > bdst.max.x)
            bdst.max.x = bsrc.max.x;
        if (bsrc.max.y > bdst.max.y)
            bdst.max.y = bsrc.max.y;
        if (bsrc.max.z > bdst.max.z)
            bdst.max.z = bsrc.max.z;
    }

};

})();


(function() {

"use strict";

var av = Autodesk.Viewing,
    avp = av.Private;

var TAU = Math.PI * 2;

var VBB_GT_TRIANGLE_INDEXED = 0,
    VBB_GT_LINE_SEGMENT     = 1,
    VBB_GT_ARC_CIRCULAR     = 2,
    VBB_GT_ARC_ELLIPTICAL   = 3,
    VBB_GT_TEX_QUAD         = 4,
    VBB_GT_ONE_TRIANGLE     = 5;

var VBB_INSTANCED_FLAG  = 0, // this is intentionally 0 for the instancing case!
    VBB_SEG_START_RIGHT = 0, // this starts intentionally at 0!
    VBB_SEG_START_LEFT  = 1,
    VBB_SEG_END_RIGHT   = 2,
    VBB_SEG_END_LEFT    = 3;

var VBB_COLOR_OFFSET    = 6,
    VBB_DBID_OFFSET     = 7,
    VBB_FLAGS_OFFSET    = 8,
    VBB_LAYER_VP_OFFSET = 9;

var QUAD_TRIANGLE_INDICES = [ 0,1,3, 0,3,2 ];

function VertexBufferBuilder(useInstancing, allocSize)
{
    var MAX_VCOUNT = allocSize || 65536;
    this.FULL_COUNT = (MAX_VCOUNT / 2 - 1) | 0;

    this.useInstancing = useInstancing;

    //TODO: Temporarily expand the stride to the full one, in order to work around new
    //more strict WebGL validation which complains when a shader addresses attributes outside
    //the vertex buffer, even when it does not actually access them. We would need separate shader
    //configurations for each of the two possible vertex strides for the selection shader, which is
    //currently shared between all 2d geometries.
    //this.stride = 10;
    this.stride = 12;

    this.vb  = new ArrayBuffer(this.stride * 4 * (this.useInstancing ? MAX_VCOUNT / 4 : MAX_VCOUNT));
    this.vbf = new Float32Array(this.vb);
    this.vbi = new Int32Array(this.vb);
    this.vcount = 0;

    this.ib = this.useInstancing ? null : new Uint16Array(MAX_VCOUNT);
    this.icount = 0;

    this.minx = this.miny =  Infinity;
    this.maxx = this.maxy = -Infinity;

    //Keeps track of objectIds referenced by geometry in the VB
    this.dbIds = {};

    this.numEllipticals   = 0;
    this.numCirculars     = 0;
    this.numTriangleGeoms = 0;
}

VertexBufferBuilder.prototype.expandStride = function()
{
    // since we already set the stride to the current max value of 12 in the
    // constructor above, we don't need to do anything here right now...
    return;

/*
    //Currently hardcoded to expand by 4 floats.
    var expandBy = 2;

    var stride = this.stride;

    if (stride >= 12)
        return;

    var nstride = this.stride + expandBy;

    var nvb = new ArrayBuffer(nstride * (this.vb.byteLength / stride));

    var src = new Uint8Array(this.vb);
    var dst = new Uint8Array(nvb);

    for (var i = 0, iEnd = this.vcount; i<iEnd; i++) {
        var os = i * stride * 4;
        var od = i * nstride * 4;

        for (var j=0; j<stride * 4; j++)
            dst[od+j] = src[os+j];
    }

    this.vb = nvb;
    this.vbf = new Float32Array(nvb);
    this.vbi = new Int32Array(nvb);
    this.stride = nstride;
*/
};

VertexBufferBuilder.prototype.addToBounds = function(x, y)
{
    if (x < this.minx) this.minx = x;
    if (x > this.maxx) this.maxx = x;
    if (y < this.miny) this.miny = y;
    if (y > this.maxy) this.maxy = y;
};

VertexBufferBuilder.prototype.setCommonVertexAttribs = function(offset, vertexId, geomType, color, dbId, layerId, vpId, linePattern)
{
    // align changes here with the "decodeCommonAttribs()" function in LineShader.js and VertexBufferReader.js!!!
    vertexId    = (vertexId    &   0xff); //  8 bit
    geomType    = (geomType    &   0xff); //  8 bit
    linePattern = (linePattern &   0xff); //  8 bit
    layerId     = (layerId     & 0xffff); // 16 bit
    vpId        = (vpId        & 0xffff); // 16 bit

    this.vbi[offset + VBB_FLAGS_OFFSET]    = vertexId | (geomType << 8) | (linePattern << 16); // vertexId: int8; geomType: int8; linePattern: int8; unused: int8
    this.vbi[offset + VBB_COLOR_OFFSET]    = color;
    this.vbi[offset + VBB_DBID_OFFSET]     = dbId;
    this.vbi[offset + VBB_LAYER_VP_OFFSET] = layerId | (vpId << 16); // layerId: int16; vpId: int16

    this.dbIds[dbId] = 1; // mark this feature as used
}

//Creates a non-indexed triangle geometry vertex (triangle vertex coords stored in single vertex structure)
VertexBufferBuilder.prototype.addVertexTriangleGeom = function(x1, y1, x2, y2, x3, y3, color, dbId, layerId, vpId)
{
    var vi  = this.vcount;
    var vbf = this.vbf;

    var repeat = this.useInstancing ? 1 : 4;
    for (var i=0; i<repeat; i++) {
        var offset = (vi+i) * this.stride;

        // align changes here with the "decodeTriangleData()" function in LineShader.js!!!
        vbf[offset]   = x1;
        vbf[offset+1] = y1;
        vbf[offset+2] = x2;

        vbf[offset+3] = y2;
        vbf[offset+4] = x3;
        vbf[offset+5] = y3;

        this.setCommonVertexAttribs(offset, VBB_SEG_START_RIGHT + i, VBB_GT_ONE_TRIANGLE, color, dbId, layerId, vpId, /*linePattern*/0);
        this.vcount++;
    }

    return vi;
};


VertexBufferBuilder.prototype.addVertexLine = function(x, y, angle, distanceAlong, totalDistance, lineWidth, color, dbId, layerId, vpId, lineType)
{
    var vi  = this.vcount;
    var vbf = this.vbf;

    var repeat = this.useInstancing ? 1 : 4;
    for (var i=0; i<repeat; i++) {
        var offset = (vi + i) * this.stride;

        // align changes here with the "decodeSegmentData()" function in LineShader.js!!!
        vbf[offset]   = x;
        vbf[offset+1] = y;
        vbf[offset+2] = angle;

        vbf[offset+3] = distanceAlong;
        vbf[offset+4] = lineWidth * 0.5; // we are storing only the half width (i.e., the radius)
        vbf[offset+5] = totalDistance;

        this.setCommonVertexAttribs(offset, VBB_SEG_START_RIGHT + i, VBB_GT_LINE_SEGMENT, color, dbId, layerId, vpId, lineType);
        this.vcount++;
    }

    return vi;
};

VertexBufferBuilder.prototype.addVertexTexQuad = function(centerX, centerY, width, height, rotation, color, dbId, layerId, vpId)
{
    var vi  = this.vcount;
    var vbf = this.vbf;

    var repeat = this.useInstancing ? 1 : 4;
    for (var i=0; i<repeat; i++) {
        var offset = (vi + i) * this.stride;

        // align changes here with the "decodeTexQuadData()" function in LineShader.js!!!
        vbf[offset]   = centerX;
        vbf[offset+1] = centerY;
        vbf[offset+2] = rotation;

        vbf[offset+3] = width;
        vbf[offset+4] = height;

        this.setCommonVertexAttribs(offset, VBB_SEG_START_RIGHT + i, VBB_GT_TEX_QUAD, color, dbId, layerId, vpId, /*linePattern*/0);
        this.vcount++;
    }

    return vi;
};


VertexBufferBuilder.prototype.addVertexArc = function(x, y, startAngle, endAngle, major, minor, tilt, lineWidth, color, dbId, layerId, vpId)
{
    var vi  = this.vcount;
    var vbf = this.vbf;

    var geomType = (major == minor) ? VBB_GT_ARC_CIRCULAR : VBB_GT_ARC_ELLIPTICAL;

    var repeat = this.useInstancing ? 1 : 4;
    for (var i=0; i<repeat; i++) {
        var offset = (vi+i) * this.stride;

        // align changes here with the "decodeArcData()" function in LineShader.js!!!
        vbf[offset]   = x;
        vbf[offset+1] = y;
        vbf[offset+2] = startAngle;

        vbf[offset+3] = endAngle;
        vbf[offset+4] = lineWidth * 0.5; // we are storing only the half width (i.e., the radius)
        vbf[offset+5] = major; // = radius for circular arcs

        if (geomType === VBB_GT_ARC_ELLIPTICAL) {
            vbf[offset+10] = minor;
            vbf[offset+11] = tilt;
        }

        this.setCommonVertexAttribs(offset, VBB_SEG_START_RIGHT + i, geomType, color, dbId, layerId, vpId, /*linePattern*/0);
        this.vcount++;
    }

    return vi;
};




//====================================================================================================
//====================================================================================================
// Indexed triangle code path can only be used when hardware instancing is not in use.
// Otherwise, the addTriangleGeom operation should be used to add simple triangles to the buffer.
//====================================================================================================
//====================================================================================================

VertexBufferBuilder.prototype.addVertex = function(x, y, color, dbId, layerId, vpId)
{
    if (this.useInstancing)
        return;//not supported if instancing is used.

    var vi     = this.vcount;
    var offset = this.stride * vi;
    var vbf    = this.vbf;

    // align changes here with the "decodeTriangleData()" function in LineShader.js!!!
    vbf[offset]   = x;
    vbf[offset+1] = y;

    this.setCommonVertexAttribs(offset, /*vertexId*/0, VBB_GT_TRIANGLE_INDEXED, color, dbId, layerId, vpId, /*linePattern*/0);
    this.vcount++;

    return vi;
};


VertexBufferBuilder.prototype.addVertexPolytriangle = function(x, y, color, dbId, layerId, vpId)
{
    if (this.useInstancing)
        return;//not supported if instancing is used.

    this.addVertex(x, y, color, dbId, layerId, vpId);

    this.addToBounds(x, y);
};

VertexBufferBuilder.prototype.addIndices = function(indices, vindex) {

    if (this.useInstancing)
        return; //not supported if instancing is used.

    var ib = this.ib;
    var ii = this.icount;

    if (ii + indices.length >= ib.length) {
        var ibnew = new Uint16Array(ib.length * 2);
        for (var i=0; i<ii; ++i) {
            ibnew[i] = ib[i];
        }
        this.ib = ib = ibnew;
    }

    for(var i=0; i<indices.length; ++i) {
        ib[ii+i] = vindex + indices[i];
    }

    this.icount += indices.length;
};

//====================================================================================================
//====================================================================================================
// End indexed triangle code path.
//====================================================================================================
//====================================================================================================


VertexBufferBuilder.prototype.finalizeQuad = function(vindex)
{
    if (!this.useInstancing) {
        this.addIndices(QUAD_TRIANGLE_INDICES, vindex);
    }
};


VertexBufferBuilder.prototype.addSegment = function(x1, y1, x2, y2, totalDistance, lineWidth, color, dbId, layerId, vpId, lineType)
{
    var dx = x2 - x1;
    var dy = y2 - y1;
    var angle  = (dx || dy) ? Math.atan2(dy, dx)       : 0.0;
    var segLen = (dx || dy) ? Math.sqrt(dx*dx + dy*dy) : 0.0;

    //Add four vertices for the bbox of this line segment
    //This call sets the stuff that's common for all four
    var v = this.addVertexLine(x1, y1, angle, segLen, totalDistance, lineWidth, color, dbId, layerId, vpId, lineType);

    this.finalizeQuad(v);
    this.addToBounds(x1, y1);
    this.addToBounds(x2, y2);
};


//Creates a non-indexed triangle geometry (triangle vertex coords stored in single vertex structure)
VertexBufferBuilder.prototype.addTriangleGeom = function(x1, y1, x2, y2, x3, y3, color, dbId, layerId, vpId)
{
    this.numTriangleGeoms++;

    var v = this.addVertexTriangleGeom(x1, y1, x2, y2, x3, y3, color, dbId, layerId, vpId);

    this.finalizeQuad(v);
    this.addToBounds(x1, y1);
    this.addToBounds(x2, y2);
    this.addToBounds(x3, y3);
};

VertexBufferBuilder.prototype.addArc = function(cx, cy, start, end, major, minor, tilt, lineWidth, color, dbId, layerId, vpId)
{
    if(major == minor)  {
        this.numCirculars++;
    } else {
        this.numEllipticals++;
    }

    // This is a workaround, when the circular arc has rotation, the extractor cannot handle it.
    // After the fix is deployed in extractor, this can be removed.
    var result = fixUglyArc(start, end);
    start = result.start;
    end   = result.end;

    //If both start and end angles are exactly 0, it's a complete ellipse/circle
    //This is working around a bug in the F2D writer, where an fmod operation will potentially.
    //convert 2pi to 0.
    if (start == 0 && end == 0)
        end = TAU;

    //Add two zero length segments as round caps at the end points
    {
        //If it's a full ellipse, then we don't need caps
        var range = Math.abs(start - end);
        if (range > 0.0001 && Math.abs(range - TAU) > 0.0001)
        {
            var sx = cx + major * Math.cos(start);
            var sy = cy + minor * Math.sin(start);
            this.addSegment(sx, sy, sx, sy, 0, lineWidth, color, dbId, layerId, vpId);

            var ex = cx + major * Math.cos(end);
            var ey = cy + minor * Math.sin(end);
            this.addSegment(ex, ey, ex, ey, 0, lineWidth, color, dbId, layerId, vpId);

            //TODO: also must add all the vertices at all multiples of PI/2 in the start-end range to get exact bounds
        }
        else
        {
            this.addToBounds(cx - major, cy - minor);
            this.addToBounds(cx + major, cy + minor);
        }
    }

    var v = this.addVertexArc(cx, cy, start, end, major, minor, tilt, lineWidth, color, dbId, layerId, vpId);

    this.finalizeQuad(v);

    //Testing caps
    if(false) {
        //If it's a full ellipse, then we don't need caps
        var range = Math.abs(start - end);
        if (Math.abs(range - TAU) > 0.0001)
        {
            var sx = cx + major * Math.cos(start);
            var sy = cy + minor * Math.sin(start);
            this.addSegment(sx, sy, sx, sy, 0, lineWidth, 0xff00ffff, dbId, layerId, vpId);

            var ex = cx + major * Math.cos(end);
            var ey = cy + minor * Math.sin(end);
            this.addSegment(ex, ey, ex, ey, 0, lineWidth, 0xff00ffff, dbId, layerId, vpId);
        }
    }
}


VertexBufferBuilder.prototype.addTexturedQuad = function(centerX, centerY, width, height, rotation, color, dbId, layerId, vpId)
{
    //Height is specified using the line weight field.
    //This will result in height being clamped to at least one pixel
    //but that's ok (zero height for an image would be rare).
    var v = this.addVertexTexQuad(centerX, centerY, width, height, rotation, color, dbId, layerId, vpId);

    this.finalizeQuad(v);

    var cos = 0.5 * Math.cos(rotation);
    var sin = 0.5 * Math.sin(rotation);
    var w = Math.abs(width * cos) + Math.abs(height * sin);
    var h = Math.abs(width * sin) + Math.abs(height * cos);
    this.addToBounds(centerX - w, centerY - h);
    this.addToBounds(centerX + w, centerY + h);
};

VertexBufferBuilder.prototype.isFull = function(addCount)
{
    addCount = addCount || 3;
    var mult = this.useInstancing ? 4 : 1;

    return (this.vcount * mult + addCount > this.FULL_COUNT);
};

VertexBufferBuilder.prototype.toMesh = function()
{
    var mesh = {};

    mesh.vb = new Float32Array(this.vb.slice(0, this.vcount * this.stride * 4));
    mesh.vbstride = this.stride;

    var d = this.useInstancing ? 1 : 0;

    mesh.vblayout = {
        "fields1" :    { offset: 0,                   itemSize: 3, bytesPerItem: 4, divisor: d, normalize: false },
        "fields2" :    { offset: 3,                   itemSize: 3, bytesPerItem: 4, divisor: d, normalize: false },
        "color4b":     { offset: VBB_COLOR_OFFSET,    itemSize: 4, bytesPerItem: 1, divisor: d, normalize: true  },
        "dbId4b":      { offset: VBB_DBID_OFFSET,     itemSize: 4, bytesPerItem: 1, divisor: d, normalize: false },
        "flags4b":     { offset: VBB_FLAGS_OFFSET,    itemSize: 4, bytesPerItem: 1, divisor: d, normalize: false },
        "layerVp4b":   { offset: VBB_LAYER_VP_OFFSET, itemSize: 4, bytesPerItem: 1, divisor: d, normalize: false }
    };

    //Are we using an expanded vertex layout -- then add the extra attribute to the layout
    if (this.stride > 10) {
        mesh.vblayout["extraParams"] = { offset: 10, itemSize: 2, bytesPerItem: 4, divisor: d, normalize: false };
    }

    if (this.useInstancing) {
        mesh.numInstances = this.vcount;

        //Set up trivial vertexId and index attributes

        var instFlags = new Int32Array([ VBB_SEG_START_RIGHT, VBB_SEG_START_LEFT, VBB_SEG_END_RIGHT, VBB_SEG_END_LEFT ]);
        mesh.vblayout.instFlags4b = { offset: 0, itemSize: 4, bytesPerItem: 1, divisor: 0, normalize: false };
        mesh.vblayout.instFlags4b.array = instFlags.buffer;

        var idx = mesh.indices = new Uint16Array(QUAD_TRIANGLE_INDICES);
    } else {
        mesh.indices = new Uint16Array(this.ib.buffer.slice(0, 2 * this.icount));
    }

    mesh.dbIds = this.dbIds;

    var w  = this.maxx - this.minx;
    var h  = this.maxy - this.miny;
    var sz = Math.max(w, h);

    mesh.boundingBox = {
        min: { x: this.minx, y: this.miny, z: -sz * 1e-3 },
        max: { x: this.maxx, y: this.maxy, z:  sz * 1e-3 }
    };

    //Also compute a rough bounding sphere
    var bs = mesh.boundingSphere = {
        center: {
            x: 0.5 * (this.minx + this.maxx),
            y: 0.5 * (this.miny + this.maxy),
            z: 0.0
        },
        radius: 0.5 * Math.sqrt(w*w + h*h)
    };

    return mesh;
};

// The following logic attempts to "fix" imprecisions in arc definitions introduced
// by Heidi's fixed point math, in case that the extractor doesn't handle it correctly.

var fixUglyArc = function (start, end)
{
    //Snap critical angles exactly
    function snapCritical() {
        function fuzzyEquals(a, b) { return (Math.abs(a - b) < 1e-3); }

        if (fuzzyEquals(start, 0))   start = 0.0;
        if (fuzzyEquals(end,   0))   end   = 0.0;
        if (fuzzyEquals(start, TAU)) start = TAU;
        if (fuzzyEquals(end,   TAU)) end   = TAU;
    }

    snapCritical();

    //OK, in some cases the angles are both over-rotated...
    if (start > end) {
        while (start > TAU) {
            start -= TAU;
            end   -= TAU;
        }
    } else {
        while (end > TAU) {
            start -= TAU;
            end   -= TAU;
        }
    }

    //Snap critical angles exactly -- again
    snapCritical();

    //If the arc crosses the x axis, we have to make it clockwise...
    //This is a side effect of bringing over-rotated arcs in range above.
    //For example start = 5.0, end = 7.0 will result in start < 0 and end > 0,
    //so we have to make start > end in order to indicate we are crossing angle = 0.
    if (start < 0 && end > 0) {
        start += TAU;
    }

    return {start: start, end: end};
};

avp.VertexBufferBuilder = VertexBufferBuilder;

})();

(function() {

"use strict";

var lmv = Autodesk.LMVTK;

/** @constructor */
function PropertyDatabase(dbjsons) {

    "use strict";

    var _this = this;

    //The property db json arrays.
    //Some of them are held unparsed in blob form
    //with helper arrays containing offsets into the blobs for each value to be parsed on demand
    var _attrs; // Array of arrays. Inner array is in the form [attrName(0), category(1), dataType(2), dataTypeContext(3), description(4), displayName(5), flags(6) ] 
                // See struct AttributeDef in https://git.autodesk.com/A360/platform-translation-propertydb/blob/master/propertydb/PropertyDatabase.h 
    var _offsets;
    var _avs;
    var _valuesBlob;
    var _valuesOffsets;
    var _idsBlob;
    var _idsOffsets;

    //Cached ids of commonly used well known attributes (child, parent, name)
    var _childAttrId;
    var _parentAttrId;
    var _nameAttrId;
    var _instanceOfAttrId;
    var _viewableInAttrId;
    var _externalRefAttrId;
    var _nodeFlagsAttrId;

    //dbjsons is expected to be of the form
    //{ attrs: {filename1:x, filename2:y}, ids: {filename1:x... }, values: {... }, offsets: {... }, avs: {... } }
    //where each of the elements of each array is a pair of the original name and the unzipped *raw* byte
    //array buffer corresponding to the respective property database constituent. In the current implementation
    //each array is expected to only have one name-value element.


    //=========================================================================

    //The attribute definitions blob is considered small enough
    //to parse using regular APIs
    for (var p in dbjsons.attrs) {
        _attrs = lmv.blobToJson(dbjsons.attrs[p]);

        for (var i = 0; i<_attrs.length; i++) {
            var category = _attrs[i][1];

            switch (category) {
                case "__parent__":      _parentAttrId = i; break;
                case "__child__":       _childAttrId = i; break;
                case "__name__":        _nameAttrId = i; break;
                case "__instanceof__":  _instanceOfAttrId = i; break;
                case "__viewable_in__": _viewableInAttrId = i; break;
                case "__externalref__": _externalRefAttrId = i; break;
                case "__node_flags__": _nodeFlagsAttrId = i; break;
                default: break;
            }
        }

        break; //currently we can only handle single property file (no chunking)
    }

    //manual parse of the attribute-value index pairs array
    for (var p in dbjsons.avs) {
        _avs = lmv.parseIntArray(dbjsons.avs[p], 0);

        delete dbjsons.avs; //don't need thi blob anymore

        break; //currently we can only handle single property file (no chunking)

    }


    //manual parse of the offsets array
    for (var p in dbjsons.offsets) {
        _offsets = lmv.parseIntArray(dbjsons.offsets[p], 1); //passing in 1 to reserve a spot for the sentinel value

        //just a sentinel value to make lookups for the last item easier
        _offsets[_offsets.length-1] = _avs.length / 2;

        delete dbjsons.offsets; //don't need this

        break; //currently we can only handle single property file (no chunking)

    }

    //Instead of parsing the values and ids arrays, find the
    //offset of each json item in the blob, and then we can
    //pick and parse specific items later on demand, without
    //parsing the potentially large json blob up front.
    for (var p in dbjsons.values) {
        _valuesBlob = dbjsons.values[p];
        _valuesOffsets = lmv.findValueOffsets(_valuesBlob);

        break; //currently we can only handle single property file (no chunking)

    }

    //Do the same for the ids array -- find the offset to each
    //value but skip the full parse. Note that the ids array is
    //optional as we don't currently use it anywhere
    for (var p in dbjsons.ids) {
        _idsBlob = dbjsons.ids[p];
        _idsOffsets = lmv.findValueOffsets(_idsBlob);

        break; //currently we can only handle single property file (no chunking)

    }



    //=========================================================================

    this.getObjectCount = function() {
        return _offsets.length-1;
    };

    this.getValueAt = function(valId) {
        return lmv.subBlobToJson(_valuesBlob, _valuesOffsets[valId]);
    };

    //faster variant used for traversing the object hierarchy where
    //we know the data type of the value to be an integer
    this.getIntValueAt = function(valId) {
        return lmv.subBlobToJsonInt(_valuesBlob, _valuesOffsets[valId]);
    };


    this.getIdAt = function(entId) {
        return lmv.subBlobToJson(_idsBlob, _idsOffsets[entId]);
    };

    this.getObjectProperties = function(dbId, propFilter, ignoreHidden, propIgnored) {
        var result = {
            "dbId":dbId,
            "properties": []
        };

        var needExternalId = false;
        var needName = false;

        if (!propFilter || propFilter.indexOf("externalId") !== -1) {
            result.externalId = this.getIdAt(dbId);
            needExternalId = true;

            // If there are no other properties required, then just return
            // Useful when we only care about fetching externalId-only data.
            if (propFilter && propFilter.length === 1) {
                return result;
            }
        }

        var parentProps = null;

        //Loop over the attribute index - value index pairs for the objects
        //and for each one look up the attribute and the value in their
        //respective arrays.
        this.enumObjectProperties(dbId, function(attrId, valId) {
            if (attrId == _instanceOfAttrId) {
                //Recursively resolve any common properties from the parent of this instance
                var res = _this.getObjectProperties(_this.getValueAt(valId), propFilter);
                if (res && res.properties) {
                    parentProps = res;
                }
                return;
            }

            var attr = _attrs[attrId];

            if (propFilter && propFilter.indexOf(attr[0]) === -1 && propFilter.indexOf(attr[5]) === -1 )
                return;

            if (propIgnored && (propIgnored.indexOf(attr[0]) > -1 || propIgnored.indexOf(attr[5]) > -1 ))
                return;

            if (attrId == _nameAttrId) {
                var val = _this.getValueAt(valId);
                needName = true;
                result.name = val;
            }
            else {
                var flags = (attr[6]) ? attr[6] : 0;
                var displayName = (attr[5]) ? attr[5] : attr[0];

                //skip structural attributes, we don't want those to display
                //NOTE: The list of structural attributes that we check explicitly is not marked
                //as hidden in older versions of the property database, so if we ever want to
                //add them to the result list, we have to explicitly set the hidden flag for those.
                var hidden = (flags & 1 /*afHidden*/)
                      || attrId == _parentAttrId
                      || attrId == _childAttrId
                      || attrId == _viewableInAttrId
                      || attrId == _externalRefAttrId;

                if (ignoreHidden && hidden) {
                    return;
                }

                // type values match those in PropertyDatabase.h
                // See: https://git.autodesk.com/A360/platform-translation-propertydb/blob/master/propertydb/PropertyDatabase.h#L67
                result.properties.push({
                    displayName: displayName,
                    displayValue: _this.getValueAt(valId),
                    displayCategory: attr[1],
                    attributeName: attr[0],
                    type: attr[2],
                    units: attr[3],
                    hidden: hidden
                });
            }
        });

        //Combine instance properties with any parent object properties
        if (parentProps) {
            var myProps = {};
            var rp = result.properties;
            for (var i=0; i<rp.length; i++) {
                myProps[rp[i].displayName] = 1;
            }

            if (!result.name)
                result.name = parentProps.name;

            var pp = parentProps.properties;
            for (var i=0; i<pp.length; i++) {
                if (!myProps.hasOwnProperty(pp[i].displayName)) {
                    rp.push(pp[i]);
                }
            }
        }

        if (propFilter && !result.properties.length && !needExternalId && !needName)
            return null;

        return result;
    };

    this.getExternalIdMapping = function() {
        var mapping = {};
        if (_idsOffsets && 'length' in _idsOffsets) { // Check that it's an indexable type
            for (var dbId=1, len=_idsOffsets.length; dbId<len; ++dbId) {
                var externalId = this.getIdAt(dbId);
                mapping[externalId] = dbId;
            }
        }
        return mapping;
    };

    //Heuristically find the root node(s) of a scene
    //A root is a node that has children, has no (or null) parent and has a name.
    //There can be multiple nodes at the top level (e.g. Revit DWF), which is why
    //we should get the scene root with absolute certainty from the SVF instance tree,
    //but we would have to uncompress and parse that in -- something that is
    //not currently done. This is good enough for now (if pretty slow).
    this.findRootNodes = function() {

        var idroots = [];

        this.enumObjects(function(id) {
            var hasChild = false;
            var hasParent = false;
            var hasName = false;

            _this.enumObjectProperties(id, function(attrId, valId) {
                if (attrId == _parentAttrId) {
                    if (_this.getIntValueAt(valId)) //checks for null or zero parent id, in which case it's considered non-parent
                        hasParent = true;
                } else if (attrId == _childAttrId) {
                    hasChild = true;
                }
                else if (attrId == _nameAttrId) {
                    hasName = true;
                }
            });

            if (hasChild && hasName && !hasParent) {
                idroots.push(id);
            }
        });

        return idroots;
    };

    //Gets the immediate children of a node with the given dbId
    this.getNodeNameAndChildren = function(node /* {dbId:X, name:""} */, skipChildren) {

        var id = node.dbId;

        var children;

        this.enumObjectProperties(id, function(attrId, valId) {
            var val;

            if (attrId == _parentAttrId) {
                //node.parent = this.getIntValueAt(valId); //eventually we will needs this instead of setting parent pointer when creating children below.
            } else if (attrId == _childAttrId && !skipChildren) {
                val = _this.getIntValueAt(valId);
                var child = { dbId:val, parent:node.dbId };
                if (!children)
                    children = [child];
                else
                    children.push(child);

            } else if (attrId == _nameAttrId) {
                node.name = _this.getValueAt(valId); //name is necessary for GUI purposes, so add it to the node object explicitly
            } else if (attrId == _nodeFlagsAttrId) {
                node.flags = _this.getIntValueAt(valId); //flags are necessary for GUI/selection purposes, so add them to the node object
            }
        });

        //If this is an instance of another object,
        //try to get the object name from there.
        //This is not done in the main loop above for performance reasons,
        //we only want to do the expensive thing of going up the object hierarchy
        //if the node does not actually have a name attribute.
        if (!node.name) {
            this.enumObjectProperties(id, function(attrId, valId) {
                if (attrId == _instanceOfAttrId) {
                     var tmp = { dbId:_this.getIntValueAt(valId), name:null };
                     _this.getNodeNameAndChildren(tmp, true);
                     if (tmp && tmp.name && !node.name)
                        node.name = tmp.name;
                }
            });
        }

        return children;
    };


//Duplicated from InstanceTree.js
var NODE_TYPE_ASSEMBLY   = 0x0,    // Real world object as assembly of sub-objects
    NODE_TYPE_GEOMETRY   = 0x6;    // Leaf geometry node

    //Builds a tree of nodes according to the parent/child hierarchy
    //stored in the property database, starting at the node with the given dbId
    this.buildObjectTreeFlat = function(dbId, //current node dbId
                                    parent, //parent dbId
                                    dbToFrag, //map of dbId to fragmentIds
                                    depth, /* start at 0 */
                                    maxDepth, /* returns max tree depth */
                                    nodeStorage
                                    ) {

        if (depth > maxDepth[0])
            maxDepth[0] = depth;

        var node = {dbId : dbId};
        var children = this.getNodeNameAndChildren(node);

        var childrenIds = [];
        var isLeaf = false;

        //leaf node
        if (dbToFrag) {
            var frags = dbToFrag[dbId];
            if (frags !== undefined) {
                if (children && children.length)
                    console.error("Node that has both node children and fragment children! Not supported by flat storage");
                if (!Array.isArray(frags))
                    childrenIds = [frags];
                else
                    childrenIds = frags;
                isLeaf = true;
            }
        }

        //Use default node flags in case none are set
        //This is not the best place to do this, but it's
        //the last place where we can differentiate between "not set" and zero.
        var flags = node.flags || 0;
        if (flags === undefined) {
            if (isLeaf)
                flags = NODE_TYPE_GEOMETRY;
            else if (children)
                flags = NODE_TYPE_ASSEMBLY;
            else
                flags = 0; //??? Should not happen (those nodes are pruned below)
        }

        if (children) {
            for (var j=0; j<children.length; j++) {
                var childHasChildren = this.buildObjectTreeFlat(children[j].dbId, dbId, dbToFrag, depth+1, maxDepth, nodeStorage);

                //For display purposes, prune children that are leafs without graphics
                //and add the rest to the node
                if (childHasChildren)
                    childrenIds.push(children[j].dbId);
            }
        }

        if (childrenIds.length)
            nodeStorage.setNode(dbId, parent, node.name, flags, childrenIds, isLeaf);

        return childrenIds.length;
    };


    this.bruteForceSearch = function(searchText, attributeNames, completeInfo) {
        //var regex = new RegExp(e.data.searchText, "i");
        searchText = searchText.toLowerCase();
        //regex preserves double-quote delimited strings as phrases
        var searchTerms = searchText.match(/"[^"]+"|[^\s]+/g) || [];
        var i = searchTerms.length;
        while (i--) {
            searchTerms[i] = searchTerms[i].replace(/"/g, "");
        }

        var searchList = [];
        for (var i=0; i<searchTerms.length; i++) {

            if (completeInfo || searchTerms[i].length > 1)
                searchList.push(searchTerms[i]);
        }

        if (searchList.length === 0)
            return [];

        //For each search word, find matching IDs
        var results = [];
        var resultNames = {};
        var completeResults = [];

        for (var k=0; k<searchList.length; k++) {
            var result = [];

            //Find all values that match the search text
            //Hopefully this is a small number, otherwise
            //we need a sorted array or an object with properties instead of array
            var matching_vals = [];

            for (var i=0, iEnd=_valuesOffsets.length; i<iEnd; i++) {
                var val = this.getValueAt(i);
                if (typeof val == "string") {
                    if (val.toLowerCase().indexOf(searchList[k]) != -1)
                        matching_vals.push(i);
                }
                else {
                    if (val.toString().toLowerCase().indexOf(searchList[k]) != -1)
                        matching_vals.push(i);
                }
            }

            this.enumObjects(function(id) {
                var name = "";
                var item = null;

                _this.enumObjectProperties(id, function(attrId, valId) {

                    var attr = _attrs[attrId];
                    var displayName = (attr[5]) ? attr[5] : attr[0];

                    if(completeInfo && displayName.toLowerCase() === "name") {
                        name = _this.getValueAt(valId);
                    }

                    if (matching_vals.indexOf(valId) != -1) {
                        //Check attribute name in case a restriction is passed in
                        if (attributeNames && attributeNames.length && attributeNames.indexOf(_attrs[attrId][0]) === -1)
                            return;

                        result.push(id);
                        item = {id: id, nodeName: "", value: _this.getValueAt(valId), name: displayName};
                        return true;
                    }
                });

                if (item && completeInfo && k === 0) {
                    //since we return the intersection we just get the completeInfo for the first term
                    item.nodeName = name;
                    if (searchList.length === 1) {
                        completeResults.push(item);
                    } else {
                        resultNames[id] = item;
                    }
                }

            });

            results.push(result);
        }

        if (results.length === 1) {
            if (completeInfo) {
                return completeResults;
            }

            return results[0];
        }

        //If each search term resulted in hits, compute the intersection of the sets
        var map = {};
        var hits = results[0];
        for (var i=0; i<hits.length; i++)
            map[hits[i]] = 1;


        for (var j=1; j<results.length; j++) {
            hits = results[j];
            var mapint = {};

            for (var i=0; i<hits.length; i++) {
                if (map[hits[i]] === 1)
                    mapint[hits[i]] = 1;
            }

            map = mapint;
        }

        var result = [];
        for (var k in map) {
            result.push(parseInt(k));
            if (completeInfo) {
                completeResults.push(resultNames[k]);
            }
        }

        if (completeInfo) {
            return completeResults;
        }

        return result;

    };


    //Low level access APIs
    this.getAttributeDef = function(attrId) {
        var _raw = _attrs[attrId];
        return {
            //attrName(0), category(1), dataType(2), dataTypeContext(3), description(4), displayName(5), flags(6)
            name:_raw[0],
            category: _raw[1],
            dataType: _raw[2],
            dataTypeContext: _raw[3],
            description: _raw[4],
            displayName: _raw[5],
            flags: _raw[6]
        };
    };

    this.enumAttributes = function(cb) {
        for (var i=1; i<_attrs.length; i++) {
            if (cb(i, this.getAttributeDef(i), _attrs[i]))
                break;
        }
    };

    this.enumObjectProperties = function(dbId, cb) {

        //Start offset of this object's properties in the Attribute-Values table
        var propStart = 2 * _offsets[dbId];

        //End offset of this object's properties in the Attribute-Values table
        var propEnd = 2 * _offsets[dbId+1];

        //Loop over the attribute index - value index pairs for the objects
        //and for each one look up the attribute and the value in their
        //respective arrays.
        for (var i=propStart; i<propEnd; i+=2) {
            var attrId = _avs[i];
            var valId = _avs[i+1];

            if (cb(attrId, valId))
                break;
        }
    };


    this.enumObjects = function(cb) {
        for (var id=1, idend=_offsets.length; id<idend; id++) {
            if (cb(id))
                break;
        }
    };

    this.getAttrChild = function() {
        return _childAttrId;
    };

    this.getAttrParent = function() {
        return _parentAttrId;
    };

    this.getAttrName = function() {
        return _nameAttrId;
    };

    this.getAttrInstanceOf = function() {
        return _instanceOfAttrId;
    };

    this.getAttrViewableIn = function() {
        return _viewableInAttrId;
    };

    this.getAttrXref = function() {
        return _externalRefAttrId;
    };

    this.getAttrNodeFlags = function() {
        return _nodeFlagsAttrId;
    };

}

lmv.PropertyDatabase = PropertyDatabase;

})();

var fullproof=fullproof||{};fullproof.AdCadScoringEngine=function(a){if(!(this instanceof fullproof.AdCadScoringEngine))return new fullproof.AdCadScoringEngine(a);this.initAbstractEngine(a)};fullproof.AbstractEngine=fullproof.AbstractEngine||function(){};fullproof.AdCadScoringEngine.prototype=new fullproof.AbstractEngine;
fullproof.AdCadScoringEngine.prototype.checkCapabilities=function(a,b){if(!0!==a.getUseScores())throw"capabilities.getUseScore() must be true";if(!0!==b.provideScore)throw"analyzer.provideScore must be true";if(!a.getComparatorObject())throw"capabilities.getComparatorObject() must return a valid comparator";return!0};
fullproof.AdCadScoringEngine.prototype.lookup=function(a,b){function c(a,g){return a>g?a:g}function f(a,g){if(0==a.length)return new fullproof.ResultSet(g.capabilities.getComparatorObject());for(var d=a.shift();0<a.length;)d.merge(a.shift(),c);return d}function e(a,g){if(0==a.length)return new fullproof.ResultSet(g.capabilities.getComparatorObject());var d=a.shift();for(d.setComparatorObject({lower_than:function(a,g){return a.value.id<g.value.id},equals:function(a,g){return a.value.id==g.value.id},
phrase:function(a,g){return a.value.fieldNameId==g.value.fieldNameId&&a.offset==g.offset+1}});0<a.length;)d.and(a.shift());return d}for(var h=this.getIndexUnits(),d=fullproof.make_synchro_point(function(a){a=f(a);a.setComparatorObject({lower_than:function(a,g){return a.score!=g.score?a.score>g.score:a.value.id<g.value.id},equals:function(a,g){return a.value.id===g.value.id}});b(a)},h.length),l=0;l<h.length;++l){var g=h[l];g.analyzer.parse(a,fullproof.make_synchro_point(function(a){if(a)if(0==a.length)b(new fullproof.ResultSet(g.capabilities.comparatorObject));
else for(var f=fullproof.make_synchro_point(function(a){a=e(a,g);if(void 0!==g.capabilities.getScoreModifier())for(var f=g.capabilities.getScoreModifier(),c=0,k=a.getDataUnsafe(),h=k.length;c<h;++c)k[c].score=void 0===k[c].score?1:k[c].score,k[c].score*=f;d(a)},a.length),c=0;c<a.length;++c)g.index.lookup(a[c].key,f)}))}};fullproof=fullproof||{};
(function(){function a(a){for(var f=[],e=0;e<a.length;++e)a[e].constructor==Array?f=f.concat(a[e]):f.push(a[e]);return f}fullproof.AbstractAnalyzer=function(){this.getArray=function(a,f){var e=fullproof.make_synchro_point(function(a){f(a)});this.parse(a,e)}};var b=function(a,f,e){e=e||net.kornr.unicode.is_letter_number;for(var h="",d=0,b=a.length;d<b;++d)e(a.charCodeAt(d))?h+=a[d]:0<h.length&&(f(h),h="");0<h.length&&f(h);f(!1)};fullproof.StandardAnalyzer=function(){function c(a,h,d){return h>=f.length?
d(a):h>=f.length?f[h](a,d):f[h](a,function(a){a&&c(a,h+1,d)})}var f=a(arguments);if(!(this instanceof fullproof.StandardAnalyzer))return new fullproof.StandardAnalyzer(f);this.provideScore=!1;this.sendFalseWhenComplete=!0;this.parse=function(a,f){var d=this;b(a,function(a){"string"===typeof a?c(a.trim(),0,f):!1===a&&d.sendFalseWhenComplete&&f&&f(!1)})}};fullproof.StandardAnalyzer.prototype=new fullproof.AbstractAnalyzer;fullproof.ScoringAnalyzer=function(){var c=a(arguments),f=new fullproof.StandardAnalyzer(c);
this.provideScore=this.sendFalseWhenComplete=f.sendFalseWhenComplete=!0;this.parse=function(a,c){var d={},b=0,g=0,k=this;f.parse(a,function(a){if(!1!==a){if(void 0===d[a]||d[a].constructor!==Array)d[a]=[];d[a].push(b);g+=++b}else{for(var f in d){a=d[f];for(var e=0,n=0;n<a.length;++n)e+=(3.1415-Math.log(1+a[n]))/10;c(new fullproof.ScoredEntry(f,void 0,1+1.5*e+Math.abs(Math.log(1+a.length))/10*3))}1==k.sendFalseWhenComplete&&c(!1)}})}};fullproof.ScoringAnalyzer.prototype=new fullproof.AbstractAnalyzer;
fullproof.AdCadScoringAnalyzer=function(){var c=a(arguments),f=new fullproof.StandardAnalyzer(c);this.provideScore=this.sendFalseWhenComplete=f.sendFalseWhenComplete=!0;this.parse=function(a,c){var d={},b=0,g=0,k=this;f.parse(a,function(a){if(!1!==a){if(void 0===d[a]||d[a].constructor!==Array)d[a]=[];d[a].push(b);g+=++b}else{for(var f in d){a=d[f];for(var e=0;e<a.length;++e)c(new fullproof.ScoredEntry(f,void 0,void 0,a[e]))}1==k.sendFalseWhenComplete&&c(!1)}})}};fullproof.AdCadScoringAnalyzer.prototype=
new fullproof.AbstractAnalyzer})();fullproof=fullproof||{};
fullproof.BooleanEngine=function(a){function b(a,f,e,h,d){if(0==h.length)return e(!1);var l=h.shift();++a.lastResultIndex;l.analyzer.parse(f,fullproof.make_synchro_point(function(g){if(!g||0==g.length)return 0<h.length?b(a,f,e,h,d):e(!1);for(var k=fullproof.make_synchro_point(function(g){for(var k=g.shift();0<g.length;){var l=g.shift();switch(d){case fullproof.BooleanEngine.CONST_MODE_UNION:k.merge(l);break;default:k.intersect(l)}}if(0==k.getSize()){if(0<h.length)return b(a,f,e,h,d);e(!1)}else e(k)},
g.length),q=0;q<g.length;++q)l.index.lookup(g[q],k)}))}if(!(this instanceof fullproof.BooleanEngine))return new fullproof.BooleanEngine(a);this.initAbstractEngine(a);this.booleanMode=fullproof.BooleanEngine.CONST_MODE_INTERSECT;this.lookup=function(a,f){this.lastResultIndex=0;b(this,a,f,this.getIndexUnits(),this.booleanMode);return this}};fullproof.AbstractEngine=fullproof.AbstractEngine||function(){};fullproof.BooleanEngine.prototype=new fullproof.AbstractEngine;
fullproof.BooleanEngine.CONST_MODE_INTERSECT=1;fullproof.BooleanEngine.CONST_MODE_UNION=2;fullproof=fullproof||{};fullproof.Capabilities=function(){if(!(this instanceof fullproof.Capabilities))return new fullproof.Capabilities};fullproof.Capabilities.prototype.matchValue=function(a,b){if(void 0===b)return!0;if("object"==typeof a&&a.constructor==Array){for(var c=0;c<a.length;++c)if(a[c]===b)return!0;return!1}return a===b};
fullproof.Capabilities.prototype.setStoreObjects=function(a){this.canStoreObjects=a;return this};fullproof.Capabilities.prototype.getStoreObjects=function(){return this.canStoreObjects};fullproof.Capabilities.prototype.setVolatile=function(a){this.isVolatile=a;return this};fullproof.Capabilities.prototype.setAvailable=function(a){this.isAvailable=!!a;return this};fullproof.Capabilities.prototype.setUseScores=function(a){this.useScores=a;return this};fullproof.Capabilities.prototype.getUseScores=function(){return this.useScores};
fullproof.Capabilities.prototype.setComparatorObject=function(a){this.comparatorObject=a;return this};fullproof.Capabilities.prototype.getComparatorObject=function(a){return this.comparatorObject};fullproof.Capabilities.prototype.setDbName=function(a){this.dbName=a;return this};fullproof.Capabilities.prototype.getDbName=function(){return this.dbName};fullproof.Capabilities.prototype.setDbSize=function(a){this.dbSize=a;return this};fullproof.Capabilities.prototype.getDbSize=function(){return this.dbSize};
fullproof.Capabilities.prototype.setScoreModifier=function(a){this.scoreModifier=a;return this};fullproof.Capabilities.prototype.getScoreModifier=function(){return this.scoreModifier};fullproof.Capabilities.prototype.isCompatibleWith=function(a){var b=this.matchValue(this.canStoreObjects,a.canStoreObjects),c=this.matchValue(this.isVolatile,a.isVolatile);a=this.matchValue(this.useScores,a.useScores);var f=!0===this.isAvailable;return b&&c&&f&&a};fullproof=fullproof||{};
fullproof.TextInjector=function(a,b){if(!(this instanceof fullproof.TextInjector))return new fullproof.TextInjector(a,b);this.index=a;this.analyzer=b};fullproof.TextInjector.prototype.inject=function(a,b,c){var f=this;void 0!=a&&""!=a&&this.analyzer.getArray(a,function(a){for(var h=fullproof.make_synchro_point(c,a.length),d=0;d<a.length;++d){var l=a[d];l instanceof fullproof.ScoredEntry?(l.value=void 0===l.value?b:l.value,f.index.inject(l.key,l,h)):f.index.inject(a[d],b,h)}})};
fullproof.TextInjector.prototype.injectBulk=function(a,b,c,f){for(var e=[],h=[],d=this,l=0,g=Math.min(a.length,b.length);l<g;++l)(function(a,g){d.analyzer.getArray(a,function(a){for(var d=0;d<a.length;++d){var f=a[d];f instanceof fullproof.ScoredEntry?(f.value=void 0===f.value?g:f.value,e.push(f.key),h.push(f)):(e.push(f),h.push(g))}})})(a[l],b[l]);this.index.injectBulk(e,h,c,f)};
fullproof.IndexUnit=function(a,b,c,f,e){this.name=a;this.capabilities=b;this.analyzer=c;this.initializer=f;this.index=e};fullproof.AbstractEngine=fullproof.AbstractEngine||function(){};fullproof.AbstractEngine.prototype.checkCapabilities=function(a,b){return!0};
fullproof.AbstractEngine.addIndexes=function(a,b,c){for(var f=!1;0<b.length;)var e=b.pop(),f=function(f,d){return function(){fullproof.AbstractEngine.addIndex(a,d.name,d.analyzer,d.capabilities,d.initializer,!1!==f?f:c)}}(f,e);!1!==f&&f();return this};
fullproof.AbstractEngine.addIndex=function(a,b,c,f,e,h){var d=new fullproof.IndexUnit(b,f,c);if(!a.checkCapabilities(f,c))return h(!1);c=new fullproof.IndexRequest(b,f,function(a,g){var f=new fullproof.TextInjector(a,d.analyzer);e(f,g)});if(a.storeManager.addIndex(c))return void 0===a.indexes&&(a.indexes=[]),a.indexes.push(d),a.indexesByName[b]=d,h&&h(!0),!0;h&&h(!1);return!1};
fullproof.AbstractEngine.prototype.open=function(a,b,c){var f=this;a=a.constructor!==Array?[a]:a;fullproof.AbstractEngine.addIndexes(f,a);this.storeManager.openIndexes(function(a){f.storeManager.forEach(function(a,d){f.indexesByName[a].index=d});b(f)},c);return this};fullproof.AbstractEngine.prototype.injectDocument=function(a,b,c){var f=fullproof.make_synchro_point(function(a){c()});this.forEach(function(e,c,d){e&&d.parse(a,function(a){a?c.inject(a,b,f):f(!1)})},!1);return this};
fullproof.AbstractEngine.prototype.clear=function(a){if(0===this.getIndexCount())return a();var b=fullproof.make_synchro_point(a,this.getIndexCount());this.forEach(function(a,f,e){a?f.clear(b):b(!1)})};fullproof.AbstractEngine.prototype.initAbstractEngine=function(a){this.storeManager=new fullproof.StoreManager(a);this.indexes=[];this.indexesByName={};return this};fullproof.AbstractEngine.prototype.getIndex=function(a){return this.indexesByName[a].index};
fullproof.AbstractEngine.prototype.getIndexUnits=function(){return[].concat(this.indexes)};fullproof.AbstractEngine.prototype.forEach=function(a){for(var b=0,c=this.indexes.length;b<c;++b)a(this.indexes[b].name,this.indexes[b].index,this.indexes[b].analyzer);for(b=1;b<arguments.length;++b)a(arguments[b]);return this};fullproof.AbstractEngine.prototype.getIndexCount=function(){return this.indexes.length};fullproof=fullproof||{};fullproof.normalizer=fullproof.normalizer||{};
fullproof.normalizer.to_lowercase_decomp=function(a,b){a=a?net.kornr.unicode.lowercase(a):a;return b?b(a):a};fullproof.normalizer.to_lowercase_nomark=function(a,b){a=a?net.kornr.unicode.lowercase_nomark(a):a;return b?b(a):a};fullproof.normalizer.remove_duplicate_letters=function(a,b){var c=a?"":!1,f=!1;if(a){for(var e=0,h=a.length;e<h;++e){if(f){var d=a[e];if(!isNaN(parseFloat(d))&&isFinite(d)||f!=a[e])c+=f}f=a[e]}c+=f?f:""}return b?b(c):c};
fullproof.normalizer.filter_in_object=function(a,b,c){return b[a]?c?c(!1):!1:c?c(a):a};fullproof=fullproof||{};
(function(){function a(a,e){return a}function b(a,e){a.score=void 0===a.score?1:a.score;e.score=void 0===e.score?1:e.score;return new fullproof.ScoredEntry(a.key,a.value,a.value.fieldNameId==e.value.fieldNameId?(0>=a.offset-e.offset?.95:1)*(a.score+e.score)/(Math.abs(a.offset-e.offset)+1):.1*(a.score+e.score),a.offset)}var c={lower_than:function(a,e){return a<e},equals:function(a,e){return a==e}};fullproof.binary_search=function(a,e,b,d,l){l=l||c.lower_than;if(void 0===b&&void 0===d)return 0==a.length?
0:fullproof.binary_search(a,e,0,a.length,l);for(;d>=b;){var g=parseInt((d+b)/2);if(g>=a.length)return a.length;if(l(a[g],e))b=g+1;else if(l(e,a[g]))d=g-1;else return g}return b};fullproof.ResultSet=function(a,e){if(!(this instanceof fullproof.ResultSet))return new fullproof.ResultSet(a,e);this.comparatorObject=a||c;this.data=e||[];this.last_insert=void 0};fullproof.ResultSet.prototype.insert=function(){for(var a=0;a<arguments.length;++a){var e=arguments[a];if(this.last_insert&&this.comparatorObject.lower_than(this.last_insert,
e))this.data.push(e),this.last_insert=e;else{var c=fullproof.binary_search(this.data,e,void 0,void 0,this.comparatorObject.lower_than);c>=this.data.length?(this.data.push(e),this.last_insert=e):!1===this.comparatorObject.equals(e,this.data[c])&&(this.data.splice(c,0,arguments[a]),this.last_insert=void 0)}}return this};fullproof.ResultSet.prototype.merge=function(f,e){e=e||a;this.last_insert=void 0;var c=!1;f.constructor==Array?c=f:f instanceof fullproof.ResultSet&&(c=f.getDataUnsafe());for(var d=
0,b=this.data.length,g=0,k=c.length,q,t,m=this.comparatorObject,n=[];d<b&&g<k;)q=this.data[d],t=c[g],m.equals(q,t)?(n.push(e(q,t)),++d,++g):m.lower_than(q,t)?(n.push(q),++d):(n.push(t),++g);for(;d<b;)n.push(this.data[d]),++d;for(;g<k;)n.push(c[g]),++g;this.data=n;return this};fullproof.ResultSet.prototype.intersect=function(a){this.last_insert=void 0;var e=!1;a.constructor==Array?e=a:a instanceof fullproof.ResultSet&&(e=a.getDataUnsafe());if(e){a=[];for(var c=0,d=0,b=this.data.length,g=e.length;c<
b;){for(;d<g&&this.comparatorObject.lower_than(e[d],this.data[c]);)++d;d<g&&this.comparatorObject.equals(e[d],this.data[c])?(a.push(e[d]),++c,++d):c++}this.data=a}else this.data=[];return this};fullproof.ResultSet.prototype.and=function(a){this.last_insert=void 0;var e=!1;a.constructor==Array?e=a:a instanceof fullproof.ResultSet&&(e=a.getDataUnsafe());if(e){a=[];for(var c=0,d=0,l=this.data.length,g=e.length;c<l;){for(;d<g&&this.comparatorObject.lower_than(e[d],this.data[c]);)++d;d<g&&this.comparatorObject.equals(e[d],
this.data[c])?(a.push(b(e[d],this.data[c])),++c,++d):c++}this.data=a}else this.data=[];return this};fullproof.ResultSet.prototype.phrase=function(a){this.last_insert=void 0;var e=!1;a.constructor==Array?e=a:a instanceof fullproof.ResultSet&&(e=a.getDataUnsafe());if(e){a=[];for(var c=0,d=0,b=this.data.length,g=e.length;c<b;){for(;d<g&&this.comparatorObject.lower_than(e[d],this.data[c]);)++d;d<g&&this.comparatorObject.equals(e[d],this.data[c])?(a.push(e[d]),++c,++d):c++}this.data=a}else this.data=[];
return this};fullproof.ResultSet.prototype.substract=function(a){this.last_insert=void 0;var c=!1;a.constructor==Array?c=a:a instanceof fullproof.ResultSet&&(c=a.getDataUnsafe());if(c){a=[];for(var b=0,d=0,l=this.data.length,g=c.length;b<l;){for(;d<g&&this.comparatorObject.lower_than(c[d],this.data[b]);)++d;d<g&&this.comparatorObject.equals(c[d],this.data[b])?(++b,++d):(a.push(this.data[b]),b++)}this.data=a}else this.data=[];return this};fullproof.ResultSet.prototype.getItem=function(a){return this.data[a]};
fullproof.ResultSet.prototype.getDataUnsafe=function(){return this.data};fullproof.ResultSet.prototype.setDataUnsafe=function(a){this.last_insert=void 0;this.data=a;return this};fullproof.ResultSet.prototype.setComparatorObject=function(a){this.comparatorObject=a;var c=this;this.data.sort(function(a,d){return c.comparatorObject.lower_than(a,d)?-1:c.comparatorObject.equals(a,d)?0:1})};fullproof.ResultSet.prototype.toString=function(){return this.data.join(",")};fullproof.ResultSet.prototype.forEach=
function(a){for(var c=0,b=this.data.length;c<b;++c)a(this.data[c]);return this};fullproof.ResultSet.prototype.getSize=function(){return this.data.length};fullproof.ResultSet.prototype.clone=function(){var a=new fullproof.ResultSet;a.setDataUnsafe(this.data.slice(0));return a}})();fullproof=fullproof||{};fullproof.ScoringEngine=function(a){if(!(this instanceof fullproof.ScoringEngine))return new fullproof.ScoringEngine(a);this.initAbstractEngine(a)};
fullproof.AbstractEngine=fullproof.AbstractEngine||function(){};fullproof.ScoringEngine.prototype=new fullproof.AbstractEngine;fullproof.ScoringEngine.prototype.checkCapabilities=function(a,b){if(!0!==a.getUseScores())throw"capabilities.getUseScore() must be true";if(!0!==b.provideScore)throw"analyzer.provideScore must be true";if(!a.getComparatorObject())throw"capabilities.getComparatorObject() must return a valid comparator";return!0};
fullproof.ScoringEngine.prototype.lookup=function(a,b){function c(a,g){if(0==a.length)return new fullproof.ResultSet(g.capabilities.getComparatorObject());for(var d=a.shift();0<a.length;)d.merge(a.shift(),fullproof.ScoredElement.mergeFn);return d}for(var f=this.getIndexUnits(),e=fullproof.make_synchro_point(function(a){a=c(a);a.setComparatorObject({lower_than:function(a,d){return a.score!=d.score?a.score>d.score:a.value<d.value},equals:function(a,d){return a.score===d.score&&a.value===d.value}});
b(a)},f.length),h=0;h<f.length;++h){var d=f[h];d.analyzer.parse(a,fullproof.make_synchro_point(function(a){if(a)if(0==a.length)b(new fullproof.ResultSet(d.capabilities.comparatorObject));else for(var g=fullproof.make_synchro_point(function(a){a=c(a,d);if(void 0!==d.capabilities.getScoreModifier())for(var g=d.capabilities.getScoreModifier(),b=0,f=a.getDataUnsafe(),k=f.length;b<k;++b)f[b].score=void 0===f[b].score?g:f[b].score*g;e(a)},a.length),f=0;f<a.length;++f)d.index.lookup(a[f].key,g)}))}};
fullproof=fullproof||{};fullproof.StoreDescriptor=function(a,b){if(!(this instanceof fullproof.StoreDescriptor))return new fullproof.StoreDescriptor(a,b);this.name=a;this.ref=b};
fullproof.StoreManager=function(a){this.available=[];fullproof.store&&(a=a||[new fullproof.StoreDescriptor("websqlstore",fullproof.store.WebSQLStore),new fullproof.StoreDescriptor("indexeddbstore",fullproof.store.IndexedDBStore),new fullproof.StoreDescriptor("memorystore",fullproof.store.MemoryStore)]);if(a&&a.length)for(var b=0;b<a.length;++b)a[b].ref&&this.available.push(a[b]);this.indexes={};this.indexesByStore={};this.storeCount=0;this.storeCache={};this.selectedStorePool=[];this.addIndex=function(a){var b;
a:{b=a.capabilities;var e=[].concat(this.available);if(e.constructor==Array&&0!=e.length)for(var h=0;h<e.length;++h)if(e[h].ref.getCapabilities().isCompatibleWith(b)){b=e[h];break a}b=!1}this.indexes[a.name]={req:a,storeRef:b};b&&(void 0===this.indexesByStore[b.name]&&(this.indexesByStore[b.name]=[],this.indexesByStore[b.name].ref=b.ref,++this.storeCount),this.indexesByStore[b.name].push(a.name));return!!b};this.openIndexes=function(a,b){if(0===this.storeCount)return a();b=b||function(){};var e=fullproof.make_synchro_point(a,
this.storeCount),h;for(h in this.indexesByStore){for(var d=new this.indexesByStore[h].ref,l=this.indexesByStore[h],g=[],k=new fullproof.Capabilities,q=0,t=0;t<l.length;++t){var m=this.indexes[l[t]];g.push(m.req);m.req.capabilities&&m.req.capabilities.getDbSize()&&(q+=Math.max(m.req.capabilities.getDbSize(),0));m.req.capabilities&&m.req.capabilities.getDbName()&&k.setDbName(m.req.capabilities.getDbName())}0!=q&&k.setDbSize(q);var n=this;d.open(k,g,function(a){if(a&&0<a.length){for(var g=0;g<a.length;++g){var c=
a[g];c.parentStore=d;c.storeName=h;n.indexes[c.name].index=c}e(d)}else b()},b)}};this.getInfoFor=function(a){return this.indexes[a]};this.getIndex=function(a){return this.indexes[a].index};this.forEach=function(a){for(var b in this.indexes)a(b,this.indexes[b].index)}};fullproof=fullproof||{};fullproof.ScoredElement=function(a,b){if(!(this instanceof fullproof.ScoredElement))return new fullproof.ScoredElement(a,b);this.value=a;this.score=void 0===b?1:b};
fullproof.ScoredElement.prototype.toString=function(){return"["+this.value+"|"+this.score+"]"};fullproof.ScoredElement.prototype.getValue=function(){return this.value};fullproof.ScoredElement.prototype.getScore=function(){return this.score};fullproof.ScoredElement.comparatorObject={lower_than:function(a,b){return a.value<b.value},equals:function(a,b){return a.value==b.value}};fullproof.ScoredElement.prototype.comparatorObject=fullproof.ScoredElement.comparatorObject;
fullproof.ScoredElement.mergeFn=function(a,b){return new fullproof.ScoredElement(a.value,a.score+b.score)};fullproof.ScoredEntry=function(a,b,c,f){if(!(this instanceof fullproof.ScoredEntry))return new fullproof.ScoredEntry(a,b,c,f);this.key=a;this.value=b;this.score=void 0===c?1:c;this.offset=f};fullproof.ScoredEntry.prototype=new fullproof.ScoredElement;
fullproof.ScoredEntry.comparatorObject={lower_than:function(a,b){return a.value.id<b.value.id},equals:function(a,b){return a.value.id==b.value.id},phrase:function(a,b){return a.offset==b.offset+1}};fullproof.ScoredEntry.prototype.getKey=function(){return this.key};fullproof.ScoredEntry.prototype.toString=function(){return"["+this.key+"="+this.value+"|"+this.score+"]"};
fullproof.make_synchro_point=function(a,b,c,f){var e=0,h=[],d=!1;return function(l){if(void 0!==f&&!1===l)throw f;!1===b||void 0===b?!1===l?!1===d&&(d=!0,a(h)):h.push(l):(++e,h.push(l),c&&console&&console.log&&console.log("synchro point "+("string"==typeof c?c+": ":": ")+e+" / "+b),e==b&&!1===d&&(d=!0,a(h)))}};fullproof.call_new_thread=function(){var a=Array.prototype.slice.call(arguments);setTimeout(function(){0<a.length&&a.shift().apply(this,a)},1)};
fullproof.make_callback=function(a){var b=Array.prototype.slice.call(arguments,1);return function(){a&&a.apply(this,b)}};fullproof.thrower=function(a){return function(){throw a;}};fullproof.bind_func=function(a,b){return function(){var c=Array.prototype.slice.apply(arguments);return b.apply(a,c)}};fullproof.filterObjectProperties=function(a,b){a instanceof fullproof.ResultSet&&(a=a.getDataUnsafe());for(var c=[],f=0,e=a.length;f<e;++f)c.push(a[f][b]);return c};
fullproof.IndexRequest=function(a,b,c){if(!(this instanceof fullproof.IndexRequest))return new fullproof.IndexRequest(a,b,c);this.name=a;this.capabilities=b;this.initializer=c};fullproof.isFunction=function(a){return"function"==typeof a||a instanceof Function};fullproof.HMap=function(){};fullproof.HMap.prototype.put=function(a,b){this["$"+a]=b};fullproof.HMap.prototype.putInArray=function(a,b){var c="$"+a;this[c]&&this[c].constructor===Array||(this[c]=[]);this[c].push(b)};
fullproof.HMap.prototype.get=function(a){return this["$"+a]};fullproof.HMap.prototype.forEach=function(a){for(var b in this)"$"===b[0]&&a(b.substring(1))};fullproof=fullproof||{};fullproof.store=fullproof.store||{};
(function(a){function b(a,d,b){a.onsuccess=d;a.onerror=b;return a}function c(a,d,c,e){a=a.put(d);b(a,fullproof.make_callback(c,d),e)}function f(a,d,b,e,f){function l(){fullproof.isFunction(b)&&(b=b());c(a,b,e,f)}try{var h=a.get(d)}catch(r){console&&console.log&&console.log(r),f(r)}h.onsuccess=function(a){void 0===a.target.result?void 0!==b?l():f():e(h.result)};h.onerror=l}function e(a,d,b,c,e){this.parent=a;this.database=d;this.name=b;this.comparatorObject=c;this.internalComparator=(this.useScore=
e)?function(a,d){return this.comparatorObject(a.value,d.value)}:function(a,d){return this.comparatorObject(a,d)}}function h(a,d,b,c,e,f){for(var h=new fullproof.HMap;c<e;++c){var r=d[c],u=b[c];void 0===h.get(r)&&(h.put(r,new fullproof.ResultSet(l)),f.push(r));u instanceof fullproof.ScoredElement?a.useScore?h.get(r).insert({v:u.value,s:u.score}):h.get(r).insert(u.value):h.get(r).insert(u)}return h}function d(a,d,b){a.objectStoreNames.contains(b)||a.createObjectStore(b,{keyPath:"id"});for(b=0;b<d.length;++b)a.objectStoreNames.contains(d[b].name)||
a.createObjectStore(d[b].name,{keyPath:"key"})}try{fullproof.store.indexedDB=indexedDB||a.indexedDB||a.webkitIndexedDB||a.mozIndexedDB||a.msIndexedDB,fullproof.store.IDBTransaction=IDBTransaction||a.IDBTransaction||a.webkitIDBTransaction||a.mozIDBTransaction||a.msIDBTransaction||{},fullproof.store.READWRITEMODE=fullproof.store.IDBTransaction.readwrite||fullproof.store.IDBTransaction.READ_WRITE||"readwrite"}catch(g){fullproof.store.indexedDB=a.indexedDB,fullproof.store.IDBTransaction=a.IDBTransaction,
fullproof.store.READWRITEMODE="readwrite"}e.prototype.clear=function(a){a=a||function(){};var d=this,c=fullproof.make_callback(a,!1),e=this.database.transaction([this.name,this.parent.metaStoreName],fullproof.store.READWRITEMODE).objectStore(this.parent.metaStoreName);b(e.put({id:this.name,init:!1}),function(){fullproof.call_new_thread(function(){var e=d.database.transaction([d.name],fullproof.store.READWRITEMODE).objectStore(d.name).clear();b(e,fullproof.make_callback(a,!0),c)})},c)};e.prototype.inject=
function(a,d,b){var e=this.database.transaction([this.name],fullproof.store.READWRITEMODE).objectStore(this.name),l=this;f(e,a,function(){return{key:a,v:[]}},function(a){var g=(new fullproof.ResultSet(l.comparatorObject)).setDataUnsafe(a.v);d instanceof fullproof.ScoredElement?l.useScore?g.insert({v:d.value,s:d.score}):g.insert(d.value):g.insert(d);a.v=g.getDataUnsafe();c(e,a,b,fullproof.make_callback(b,!1))},fullproof.make_callback(b,!1))};var l={lower_than:function(a,d){return(a.v?a.v:a)<(d.v?d.v:
d)},equals:function(a,d){return(a.v?a.v:a)===(d.v?d.v:d)}};e.prototype.injectBulk=function(a,d,b,e){function l(a,d,b,g,e,k){e&&e(k/d.length);var h=a.database.transaction([a.name],fullproof.store.READWRITEMODE);h.oncomplete=function(){k+100<d.length?fullproof.call_new_thread(l,a,d,b,g,e,k+100):fullproof.call_new_thread(g,!0)};h.onerror=function(){g(!1)};for(var q=h.objectStore(a.name),h=k,n=Math.min(d.length,k+100);h<n;++h){var t=d[h];(function(d,b){f(q,d,function(){return{key:d,v:[]}},function(d){var g=
(new fullproof.ResultSet(a.comparatorObject)).setDataUnsafe(d.v);g.merge(b);d.v=g.getDataUnsafe();c(q,d,function(){},function(){})})})(t,b.get(t))}}if(a.length!==d.length)throw"Can't injectBulk, arrays length mismatch";var n=[];a=h(this,a,d,0,a.length,n);0<n.length?l(this,n,a,b,e,0):b(!0)};e.prototype.lookup=function(a,d){var b=this.database.transaction([this.name]).objectStore(this.name),c=this;f(b,a,void 0,function(b){if(b&&b.v){for(var e=new fullproof.ResultSet(c.comparatorObject),f=0,h=b.v.length;f<
h;++f){var l=b.v[f];c.useScore?e.insert(new fullproof.ScoredEntry(a,l.v,l.s)):e.insert(l)}d(e)}else d(new fullproof.ResultSet(c.comparatorObject))},function(){d(new fullproof.ResultSet(c.comparatorObject))})};fullproof.store.IndexedDBStore=function(a){this.meta=this.database=null;this.metaStoreName="fullproof_metatable";this.stores={};this.opened=!1;this.dbName="fullproof";this.dbSize=5242880;this.dbVersion=a||"1.0"};fullproof.store.IndexedDBStore.storeName="MemoryStore";fullproof.store.IndexedDBStore.getCapabilities=
function(){return(new fullproof.Capabilities).setStoreObjects(!1).setVolatile(!1).setAvailable(null!=fullproof.store.indexedDB).setUseScores([!0,!1])};fullproof.store.IndexedDBStore.prototype.setOptions=function(a){this.dbSize=a.dbSize||this.dbSize;this.dbName=a.dbName||this.dbName;return this};fullproof.store.IndexedDBStore.prototype.open=function(a,c,l,h){function m(a,d,c,g,e){if(0==c.length)return g(!0);var k=a.transaction([d.metaStoreName],fullproof.store.READWRITEMODE).objectStore(d.metaStoreName),
h=c.shift();f(k,h.name,{id:h.name,init:!1},function(f){if(0==f.init&&h.initializer){var k=d.getIndex(h.name);fullproof.call_new_thread(function(){k.clear(function(){h.initializer(d.getIndex(h.name),function(){fullproof.call_new_thread(m,a,d,c,g,e);fullproof.call_new_thread(function(){var c=a.transaction([d.metaStoreName],fullproof.store.READWRITEMODE).objectStore(d.metaStoreName);f.init=!0;b(c.put(f),function(){},function(){})})})})})}else fullproof.call_new_thread(m,a,d,c,g,e)},e)}function n(a,b,
c,g,f){d(b,c,a.metaStoreName);for(var k=0;k<a.indexRequests.length;++k){var h=a.indexRequests[k],l=h.capabilities.getComparatorObject()?h.capabilities.getComparatorObject():a.useScore?fullproof.ScoredElement.comparatorObject:void 0,l=new e(a,a.database,h.name,l,h.capabilities.getUseScores());a.stores[h.name]=l;r.push(l)}fullproof.call_new_thread(m,b,a,[].concat(c),g,f)}void 0!==a.getDbName()&&(this.dbName=a.getDbName());void 0!==a.getDbSize()&&(this.dbSize=a.getDbSize());var p=this,r=[];this.indexRequests=
c;a=fullproof.store.indexedDB.open(this.dbName,this.dbVersion);a.onerror=function(){h()};a.onsuccess=function(a){p.database=a.result||a.target.result;void 0!==p.database.version&&p.database.setVersion&&p.database.version!=p.dbVersion?(a=p.database.setVersion(p.dbVersion),a.onerror=fullproof.make_callback(h,"Can't change version with setVersion("+p.dbVersion+")"),a.onsuccess=function(a){d(p.database,c,p.metaStoreName);n(p,p.database,p.indexRequests,function(){l(r)},h)}):n(p,p.database,p.indexRequests,
fullproof.make_callback(l,r),h)};a.onupgradeneeded=function(a){d(a.target.result,c,p.metaStoreName)}};fullproof.store.IndexedDBStore.prototype.close=function(a){a()};fullproof.store.IndexedDBStore.prototype.getIndex=function(a){return this.stores[a]}})("undefined"===typeof window?{}:window);fullproof=fullproof||{};fullproof.store=fullproof.store||{};
(function(){function a(){this.data={};this.comparatorObject=null;this.useScore=!1}function b(a,b){b&&b(this)}function c(b,c,h,d,l){var g=new a,k=void 0!==h.getUseScores()?h.getUseScores():!1;g.comparatorObject=h.getComparatorObject()?h.getComparatorObject():k?fullproof.ScoredElement.comparatorObject:void 0;g.useScore=k;g.name=c;b.indexes[c]=g;d?d(g,function(){l(g)}):l(g);return g}fullproof.store.MemoryStore=function(){if(!(this instanceof fullproof.store.MemoryStore))return new fullproof.store.MemoryStore(comparatorObject);
this.indexes={};return this};fullproof.store.MemoryStore.getCapabilities=function(){return(new fullproof.Capabilities).setStoreObjects([!0,!1]).setVolatile(!0).setAvailable(!0).setUseScores([!0,!1])};fullproof.store.MemoryStore.storeName="MemoryStore";fullproof.store.MemoryStore.prototype.open=function(a,e,h,d){var l=this;b(a,function(){for(var a=fullproof.make_synchro_point(function(a){h(a)},e.length),d=0,b=e.length;d<b;++d){var f=e[d];c(l,f.name,f.capabilities,f.initializer,a)}})};fullproof.store.MemoryStore.prototype.getIndex=
function(a){return this.indexes[a]};fullproof.store.MemoryStore.prototype.close=function(a){this.indexes={};a(this)};a.prototype.clear=function(a){this.data={};a&&a(!0);return this};a.prototype.inject=function(a,b,c){this.data[a]||(this.data[a]=new fullproof.ResultSet(this.comparatorObject));!1===this.useScore&&b instanceof fullproof.ScoredElement?this.data[a].insert(b.value):this.data[a].insert(b);c&&c(a,b);return this};a.prototype.injectBulk=function(a,b,c,d){for(var l=0;l<a.length&&l<b.length;++l)0===
l%1E3&&d&&d(l/a.length),this.inject(a[l],b[l]);c&&c(a,b);return this};a.prototype.lookup=function(a,b){b(this.data[a]?this.data[a].clone():new fullproof.ResultSet);return this}})();fullproof=fullproof||{};fullproof.store=fullproof.store||{};
(function(a){function b(){this.comparatorObject=this.tableName=this.store=this.db=null;this.opened=this.useScore=!1}function c(a,b,c){a.executeSql("SELECT * FROM "+b+" LIMIT 1,0",[],function(a,d){1==d.rows.length?c(!0):c(!1)},fullproof.make_callback(c,!1))}function f(a,b,g){this.tablename="fullproofmetadata";var e=this;this.createIndex=function(b,g,f){var h=fullproof.make_callback(f);a.db.transaction(function(f){c(f,b,function(c){c?g(!0):f.executeSql("CREATE TABLE IF NOT EXISTS "+b+" (id NCHAR(48), value, score)",
[],function(){a.db.transaction(function(a){a.executeSql("CREATE INDEX IF NOT EXISTS "+b+"_indx ON "+b+" (id)",[],function(){a.executeSql("INSERT OR REPLACE INTO "+e.tablename+" (id, initialized) VALUES (?,?)",[b,!1],fullproof.make_callback(g,!0),h)},h)})},h)})})};this.loadMetaData=function(b){a.db.transaction(function(a){a.executeSql("SELECT * FROM "+e,tablename+" WHERE id=?",[tableName],function(a,d){for(var c={},g=0;g<d.rows.length;++g){var e=d.rows.item(g);c[e.id]={name:e.id,initialized:e.initialized,
ctime:e.ctime,version:e.version}}b(c)},fullproof.make_callback(b,{}))})};this.isInitialized=function(b,c){a.db.transaction(function(a){a.executeSql("SELECT * FROM "+e.tablename+" WHERE id=?",[b],function(a,d){if(1==d.rows.length){var b=d.rows.item(0);c("true"==b.initialized)}else c(!1)},fullproof.make_callback(c,!1))})};this.setInitialized=function(b,c,g){a.db.transaction(function(a){a.executeSql("INSERT OR REPLACE INTO "+e.tablename+" (id, initialized) VALUES (?,?)",[b,c?"true":"false"],fullproof.make_callback(g,
!0),fullproof.make_callback(g,!1))})};this.getIndexSize=function(b,c){a.db.transaction(function(a){a.executeSql("SELECT count(*) AS cnt FROM "+b,[],function(a,d){if(1==d.rows.length){var b=d.rows.item(0);if(void 0!==b.cnt)return c(b.cnt)}c(!1)},function(){c(!1)})})};this.eraseMeta=function(b){e.loadMetaData(function(b){a.db.transaction(function(a){var d=0,c;for(c in b)++d;fullproof.make_synchro_point(function(){a.executeSql("DROP TABLE IF EXISTS "+e.tablename,[],fullproof.make_callback(g,!0),fullproof.make_callback(g,
!1))},d);for(c in b)a.executeSql("DROP TABLE IF EXISTS "+c)})})};a.db.transaction(function(c){c.executeSql("CREATE TABLE IF NOT EXISTS "+e.tablename+" (id VARCHAR(52) NOT NULL PRIMARY KEY, initialized, version, ctime)",[],function(){b(a)},fullproof.make_callback(g,!1))})}function e(a,c,g,e,f,h){if(0==a.opened||!a.meta)return f(!1);g=g||{};var m=new b;m.store=a;var n=void 0!==g.getUseScores()?g.getUseScores():!1;m.db=a.db;m.tableName=m.name=c;m.comparatorObject=g.getComparatorObject()?g.getComparatorObject():
n?fullproof.ScoredElement.comparatorObject:void 0;m.useScore=n;a.meta.isInitialized(c,function(b){if(b)return f(m);a.meta.createIndex(c,function(){a.indexes[c]=m;e?fullproof.call_new_thread(function(){m.clear(function(){fullproof.call_new_thread(function(){e(m,function(){m.opened=!0;a.meta.setInitialized(c,!0,fullproof.make_callback(f,m))})})})}):f(m)},h)})}function h(a,b,c){a.opened=!1;void 0!==b.getDbName()&&(a.dbName=b.getDbName());void 0!==b.getDbSize()&&(a.dbSize=b.getDbSize());try{a.db=openDatabase(a.dbName,
"1.0","javascript search engine",a.dbSize)}catch(e){console&&console.log&&console.log("websql: ERROR in openStore"+e)}a.opened=!0;a.meta=new f(a,function(a){c(a)},fullproof.make_callback(c,!1))}fullproof.store.WebSQLStore=function(){if(!(this instanceof fullproof.store.WebSQLStore))return new fullproof.store.WebSQLStore;this.internal_init=function(){this.meta=this.db=null;this.tables={};this.indexes={};this.opened=!1;this.dbName="fullproof";this.dbSize=5242880};this.internal_init()};fullproof.store.WebSQLStore.getCapabilities=
function(){try{return(new fullproof.Capabilities).setStoreObjects(!1).setVolatile(!1).setAvailable(a.openDatabase).setUseScores([!0,!1])}catch(d){return(new fullproof.Capabilities).setAvailable(!1)}};fullproof.store.WebSQLStore.storeName="WebsqlStore";fullproof.store.WebSQLStore.prototype.setOptions=function(a){this.dbSize=a.dbSize||this.dbSize;this.dbName=a.dbName||this.dbName;return this};fullproof.store.WebSQLStore.prototype.open=function(a,b,c,f){function q(a){if(0==a.length)return c(m);var b=
a.shift();e(t,b.name,b.capabilities,b.initializer,function(b){m.push(b);q(a)})}var t=this,m=[];this.dbName=a.getDbName()||this.dbName;h(this,a,function(a){fullproof.make_synchro_point(c,b.length);[].concat(b);q([].concat(b))})};fullproof.store.WebSQLStore.prototype.close=function(a){this.internal_init();a()};fullproof.store.WebSQLStore.prototype.getIndex=function(a){return this.indexes[a]};b.prototype.clear=function(a){var b=this;this.db.transaction(function(c){c.executeSql("DELETE FROM "+b.tableName,
[],function(){b.store.meta.setInitialized(b.name,!1,a)},function(){fullproof.make_callback(a,!1)()})})};b.prototype.inject=function(a,b,c){var e=this;this.db.transaction(function(f){b instanceof fullproof.ScoredElement?f.executeSql("INSERT OR REPLACE INTO "+e.tableName+" (id,value, score) VALUES (?,?,?)",[a,b.value,b.score],fullproof.make_callback(c,!0),fullproof.make_callback(c,!1)):f.executeSql("INSERT OR REPLACE INTO "+e.tableName+" (id,value) VALUES (?,?)",[a,b],fullproof.make_callback(c,!0),
fullproof.make_callback(c,!1))})};b.prototype.injectBulk=function(a,b,c,e){var f=this;if(a.length!=b.length)throw"Can't injectBulk, arrays length mismatch";fullproof.make_synchro_point(c,void 0,!0);var h=a.length,m=function(a,b,d){d>=a.length&&fullproof.call_new_thread(c,!0);var l=Math.min(d+100,a.length);e&&h&&e(d/h);var v=fullproof.make_synchro_point(function(){fullproof.call_new_thread(m,a,b,l)},l-d);f.db.transaction(function(c){for(var e=d;e<l;++e){var g=b[e];g instanceof fullproof.ScoredEntry?
f.useScore?c.executeSql("INSERT INTO "+f.tableName+" (id,value, score) VALUES (?,?,?)",[a[e],g.value,g.score],v,function(){}):c.executeSql("INSERT INTO "+f.tableName+" (id,value) VALUES (?,?)",[a[e],g.value],v,v):f.useScore?c.executeSql("INSERT INTO "+f.tableName+" (id,value, score) VALUES (?,?,?)",[a[e],g,1],v,v):c.executeSql("INSERT INTO "+f.tableName+" (id,value) VALUES (?,?)",[a[e],g],function(){v()},function(){v(!0)})}})};m(a,b,0)};b.prototype.lookup=function(a,b){var c=this;this.db.transaction(function(e){e.executeSql("SELECT * FROM "+
c.tableName+" WHERE id=? ORDER BY value ASC",[a],function(a,d){for(var e=new fullproof.ResultSet(c.comparatorObject),f=0;f<d.rows.length;++f){var h=d.rows.item(f);h&&(null===h.score||void 0===h.score||!1===h.score?e.insert(h.value):e.insert(new fullproof.ScoredEntry(h.id,h.value,h.score)))}b(e)},function(){b(!1)})})}})("undefined"===typeof window?{}:window);fullproof=fullproof||{};
(function(){function a(){if("undefined"!==typeof window.XMLHttpRequest)return new window.XMLHttpRequest;if("function"===typeof window.ActiveXObject){try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")}catch(a){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")}catch(a){}try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(a){}}throw"Error, can't find a suitable XMLHttpRequest object";}fullproof.DataLoader=function(){if(!(this instanceof fullproof.DataLoader))return new fullproof.DataLoader;var b=
[],c=[];this.setQueue=function(){for(var a=0;a<arguments.length;++a)arguments[a].constructor==Array?b=b.concat(arguments[a]):b.push(arguments[a]);return this};var f=function(b,h,d){if(0==c.length)b();else{var l=c.shift(),g=a();g.onreadystatechange=function(){if(4==g.readyState)if(200!=g.status)d&&(d(l),f(b,h,d));else{var a=g.responseText;h&&(h(a,l),f(b,h,d))}};g.open("GET",l,!0);g.send(null)}};this.start=function(a,h,d){c=[].concat(b);f(a,h,d)}}})();var net=net||{};net.kornr=net.kornr||{};
net.kornr.unicode=net.kornr.unicode||{};
net.kornr.unicode.categ_letters_numbers_data=[[48,57],[65,90],[97,122],170,[178,179],181,[185,186],[188,190],[192,214],[216,246],[248,705],[710,721],[736,740],748,750,[880,884],[886,887],[890,893],902,[904,906],908,[910,929],[931,1013],[1015,1153],[1162,1319],[1329,1366],1369,[1377,1415],[1488,1514],[1520,1522],[1568,1610],[1632,1641],[1646,1647],[1649,1747],1749,[1765,1766],[1774,1788],1791,1808,[1810,1839],[1869,1957],1969,[1984,2026],[2036,2037],2042,[2048,2069],2074,2084,2088,[2112,2136],2208,
[2210,2220],[2308,2361],2365,2384,[2392,2401],[2406,2415],[2417,2423],[2425,2431],[2437,2444],[2447,2448],[2451,2472],[2474,2480],2482,[2486,2489],2493,2510,[2524,2525],[2527,2529],[2534,2545],[2548,2553],[2565,2570],[2575,2576],[2579,2600],[2602,2608],[2610,2611],[2613,2614],[2616,2617],[2649,2652],2654,[2662,2671],[2674,2676],[2693,2701],[2703,2705],[2707,2728],[2730,2736],[2738,2739],[2741,2745],2749,2768,[2784,2785],[2790,2799],[2821,2828],[2831,2832],[2835,2856],[2858,2864],[2866,2867],[2869,
2873],2877,[2908,2909],[2911,2913],[2918,2927],[2929,2935],2947,[2949,2954],[2958,2960],[2962,2965],[2969,2970],2972,[2974,2975],[2979,2980],[2984,2986],[2990,3001],3024,[3046,3058],[3077,3084],[3086,3088],[3090,3112],[3114,3123],[3125,3129],3133,[3160,3161],[3168,3169],[3174,3183],[3192,3198],[3205,3212],[3214,3216],[3218,3240],[3242,3251],[3253,3257],3261,3294,[3296,3297],[3302,3311],[3313,3314],[3333,3340],[3342,3344],[3346,3386],3389,3406,[3424,3425],[3430,3445],[3450,3455],[3461,3478],[3482,
3505],[3507,3515],3517,[3520,3526],[3585,3632],[3634,3635],[3648,3654],[3664,3673],[3713,3714],3716,[3719,3720],3722,3725,[3732,3735],[3737,3743],[3745,3747],3749,3751,[3754,3755],[3757,3760],[3762,3763],3773,[3776,3780],3782,[3792,3801],[3804,3807],3840,[3872,3891],[3904,3911],[3913,3948],[3976,3980],[4096,4138],[4159,4169],[4176,4181],[4186,4189],4193,[4197,4198],[4206,4208],[4213,4225],4238,[4240,4249],[4256,4293],4295,4301,[4304,4346],[4348,4680],[4682,4685],[4688,4694],4696,[4698,4701],[4704,
4744],[4746,4749],[4752,4784],[4786,4789],[4792,4798],4800,[4802,4805],[4808,4822],[4824,4880],[4882,4885],[4888,4954],[4969,4988],[4992,5007],[5024,5108],[5121,5740],[5743,5759],[5761,5786],[5792,5866],[5870,5872],[5888,5900],[5902,5905],[5920,5937],[5952,5969],[5984,5996],[5998,6E3],[6016,6067],6103,6108,[6112,6121],[6128,6137],[6160,6169],[6176,6263],[6272,6312],6314,[6320,6389],[6400,6428],[6470,6509],[6512,6516],[6528,6571],[6593,6599],[6608,6618],[6656,6678],[6688,6740],[6784,6793],[6800,6809],
6823,[6917,6963],[6981,6987],[6992,7001],[7043,7072],[7086,7141],[7168,7203],[7232,7241],[7245,7293],[7401,7404],[7406,7409],[7413,7414],[7424,7615],[7680,7957],[7960,7965],[7968,8005],[8008,8013],[8016,8023],8025,8027,8029,[8031,8061],[8064,8116],[8118,8124],8126,[8130,8132],[8134,8140],[8144,8147],[8150,8155],[8160,8172],[8178,8180],[8182,8188],[8304,8305],[8308,8313],[8319,8329],[8336,8348],8450,8455,[8458,8467],8469,[8473,8477],8484,8486,8488,[8490,8493],[8495,8505],[8508,8511],[8517,8521],8526,
[8528,8585],[9312,9371],[9450,9471],[10102,10131],[11264,11310],[11312,11358],[11360,11492],[11499,11502],[11506,11507],11517,[11520,11557],11559,11565,[11568,11623],11631,[11648,11670],[11680,11686],[11688,11694],[11696,11702],[11704,11710],[11712,11718],[11720,11726],[11728,11734],[11736,11742],11823,[12293,12295],[12321,12329],[12337,12341],[12344,12348],[12353,12438],[12445,12447],[12449,12538],[12540,12543],[12549,12589],[12593,12686],[12690,12693],[12704,12730],[12784,12799],[12832,12841],[12872,
12879],[12881,12895],[12928,12937],[12977,12991],13312,19893,19968,40908,[40960,42124],[42192,42237],[42240,42508],[42512,42539],[42560,42606],[42623,42647],[42656,42735],[42775,42783],[42786,42888],[42891,42894],[42896,42899],[42912,42922],[43E3,43009],[43011,43013],[43015,43018],[43020,43042],[43056,43061],[43072,43123],[43138,43187],[43216,43225],[43250,43255],43259,[43264,43301],[43312,43334],[43360,43388],[43396,43442],[43471,43481],[43520,43560],[43584,43586],[43588,43595],[43600,43609],[43616,
43638],43642,[43648,43695],43697,[43701,43702],[43705,43709],43712,43714,[43739,43741],[43744,43754],[43762,43764],[43777,43782],[43785,43790],[43793,43798],[43808,43814],[43816,43822],[43968,44002],[44016,44025],44032,55203,[55216,55238],[55243,55291],[63744,64109],[64112,64217],[64256,64262],[64275,64279],64285,[64287,64296],[64298,64310],[64312,64316],64318,[64320,64321],[64323,64324],[64326,64433],[64467,64829],[64848,64911],[64914,64967],[65008,65019],[65136,65140],[65142,65276],[65296,65305],
[65313,65338],[65345,65370],[65382,65470],[65474,65479],[65482,65487],[65490,65495],[65498,65500],[65536,65547],[65549,65574],[65576,65594],[65596,65597],[65599,65613],[65616,65629],[65664,65786],[65799,65843],[65856,65912],65930,[66176,66204],[66208,66256],[66304,66334],[66336,66339],[66352,66378],[66432,66461],[66464,66499],[66504,66511],[66513,66517],[66560,66717],[66720,66729],[67584,67589],67592,[67594,67637],[67639,67640],67644,[67647,67669],[67672,67679],[67840,67867],[67872,67897],[67968,
68023],[68030,68031],68096,[68112,68115],[68117,68119],[68121,68147],[68160,68167],[68192,68222],[68352,68405],[68416,68437],[68440,68466],[68472,68479],[68608,68680],[69216,69246],[69635,69687],[69714,69743],[69763,69807],[69840,69864],[69872,69881],[69891,69926],[69942,69951],[70019,70066],[70081,70084],[70096,70105],[71296,71338],[71360,71369],[73728,74606],[74752,74850],[77824,78894],[92160,92728],[93952,94020],94032,[94099,94111],[110592,110593],[119648,119665],[119808,119892],[119894,119964],
[119966,119967],119970,[119973,119974],[119977,119980],[119982,119993],119995,[119997,120003],[120005,120069],[120071,120074],[120077,120084],[120086,120092],[120094,120121],[120123,120126],[120128,120132],120134,[120138,120144],[120146,120485],[120488,120512],[120514,120538],[120540,120570],[120572,120596],[120598,120628],[120630,120654],[120656,120686],[120688,120712],[120714,120744],[120746,120770],[120772,120779],[120782,120831],[126464,126467],[126469,126495],[126497,126498],126500,126503,[126505,
126514],[126516,126519],126521,126523,126530,126535,126537,126539,[126541,126543],[126545,126546],126548,126551,126553,126555,126557,126559,[126561,126562],126564,[126567,126570],[126572,126578],[126580,126583],[126585,126588],126590,[126592,126601],[126603,126619],[126625,126627],[126629,126633],[126635,126651],[127232,127242],131072,173782,173824,177972,177984,178205,[194560,195101]];net=net||{};net.kornr=net.kornr||{};net.kornr.unicode=net.kornr.unicode||{};
net.kornr.unicode.norm_lowercase_nomark_data=[[65,90,"R",32],[160,168,"A",32],[170,97],[175,32],[178,179,"R",-128],[180,32],[181,956],[184,32],[185,49],[186,111],[188,[49,8260,52]],[189,[49,8260,50]],[190,[51,8260,52]],[192,197,"A",97],[198,230],[199,99],[200,203,"A",101],[204,207,"A",105],[208,240],[209,210,"R",-99],[211,214,"A",111],[216,248],[217,220,"A",117],[221,121],[222,254],[224,229,"A",97],[231,99],[232,235,"A",101],[236,239,"A",105],[241,242,"R",-131],[243,246,"A",111],[249,252,"A",117],
[253,255,"A",121],[256,261,"A",97],[262,269,"A",99],[270,271,"A",100],[272,273],[274,283,"A",101],[284,291,"A",103],[292,293,"A",104],[294,295],[296,304,"A",105],[306,[105,106]],[307,[105,106]],[308,309,"A",106],[310,311,"A",107],[313,318,"A",108],[319,[108,183]],[320,[108,183]],[321,322],[323,328,"A",110],[329,[700,110]],[330,331],[332,337,"A",111],[338,339],[340,345,"A",114],[346,353,"A",115],[354,357,"A",116],[358,359],[360,371,"A",117],[372,373,"A",119],[374,376,"A",121],[377,382,"A",122],[383,
115],[385,595],[386,388,"R",1],[390,596],[391,392],[393,394,"R",205],[395,396],[398,477],[399,601],[400,603],[401,402],[403,608],[404,611],[406,617],[407,616],[408,409],[412,623],[413,626],[415,629],[416,417,"A",111],[418,420,"R",1],[422,640],[423,424],[425,643],[428,429],[430,648],[431,432,"A",117],[433,434,"R",217],[435,437,"R",1],[439,658],[440,444,"R",1],[452,[100,382]],[453,[100,382]],[454,[100,382]],[455,[108,106]],[456,[108,106]],[457,[108,106]],[458,[110,106]],[459,[110,106]],[460,[110,106]],
[461,462,"A",97],[463,464,"A",105],[465,466,"A",111],[467,468,"A",117],[469,476,"A",252],[478,479,"A",228],[480,481,"A",551],[482,483,"A",230],[484,485],[486,487,"A",103],[488,489,"A",107],[490,491,"A",111],[492,493,"A",491],[494,495,"A",658],[496,106],[497,[100,122]],[498,[100,122]],[499,[100,122]],[500,501,"A",103],[502,405],[503,447],[504,505,"A",110],[506,507,"A",229],[508,509,"A",230],[510,511,"A",248],[512,515,"A",97],[516,519,"A",101],[520,523,"A",105],[524,527,"A",111],[528,531,"A",114],[532,
535,"A",117],[536,537,"A",115],[538,539,"A",116],[540,541],[542,543,"A",104],[544,414],[546,548,"R",1],[550,551,"A",97],[552,553,"A",101],[554,555,"A",246],[556,557,"A",245],[558,559,"A",111],[560,561,"A",559],[562,563,"A",121],[570,11365],[571,572],[573,410],[574,11366],[577,578],[579,384],[580,649],[581,652],[582,590,"R",1],[688,104],[689,614],[690,106],[691,114],[692,633],[693,635],[694,641],[695,119],[696,121],[728,733,"A",32],[736,611],[737,108],[738,115],[739,120],[740,661],[832,836,"R",0],
[880,882,"R",1],[884,697],[886,887],[890,32],[894,59],[900,32],[901,168],[902,945],[903,183],[904,949],[905,951],[906,953],[908,959],[910,965],[911,912,"R",58],[913,937,"R",32],[938,953],[939,965],[940,945],[941,949],[942,951],[943,953],[944,971],[970,953],[971,965],[972,959],[973,965],[974,969],[975,983],[976,946],[977,952],[978,933],[979,980,"A",978],[981,966],[982,960],[984,1006,"R",1],[1008,954],[1009,1010,"R",-48],[1012,952],[1013,949],[1015,1016],[1017,962],[1018,1019],[1021,1023,"R",-130],
[1024,1025,"A",1077],[1026,1106],[1027,1075],[1028,1030,"R",80],[1031,1110],[1032,1035,"R",80],[1036,1082],[1037,1080],[1038,1091],[1039,1119],[1040,1048,"R",32],[1049,1080],[1050,1071,"R",32],[1081,1080],[1104,1105,"A",1077],[1107,1075],[1111,1110],[1116,1082],[1117,1080],[1118,1091],[1120,1140,"R",1],[1142,1143,"A",1141],[1144,1214,"R",1],[1216,1231],[1217,1218,"A",1078],[1219,1229,"R",1],[1232,1235,"A",1072],[1236,1237],[1238,1239,"A",1077],[1240,1243,"A",1241],[1244,1245,"A",1078],[1246,1247,
"A",1079],[1248,1249],[1250,1253,"A",1080],[1254,1255,"A",1086],[1256,1259,"A",1257],[1260,1261,"A",1101],[1262,1267,"A",1091],[1268,1269,"A",1095],[1270,1271],[1272,1273,"A",1099],[1274,1318,"R",1],[1329,1366,"R",48],[1415,[1381,1410]],[1570,1571,"A",1575],[1572,1608],[1573,1575],[1574,1610],[1653,[1575,1652]],[1654,[1608,1652]],[1655,[1735,1652]],[1656,[1610,1652]],[1728,1749],[1730,2356,"R",-1],[2392,2394,"R",-67],[2395,2332],[2396,2397,"R",-59],[2398,2347],[2399,2351],[2507,2508,"R",0],[2524,
2525,"R",-59],[2527,2479],[2611,2610],[2614,2616],[2649,2650,"R",-67],[2651,2588],[2654,2603],[2888,2892,"R",0],[2908,2909,"R",-59],[2964,2962],[3018,3550,"R",0],[3635,3763,"R",-1],[3804,[3755,3737]],[3805,[3755,3745]],[3852,3932,"R",-1],[3945,3904],[3955,4025,"R",0],[4134,4133],[4256,4301,"R",7264],[4348,4316],[6918,6930,"R",-1],[6971,6979,"R",0],[7468,65],[7469,198],[7470,7473,"R",-7404],[7474,398],[7475,7482,"R",-7404],[7484,79],[7485,546],[7486,80],[7487,82],[7488,7489,"R",-7404],[7490,87],[7491,
97],[7492,7493,"R",-6900],[7494,7426],[7495,98],[7496,7497,"R",-7396],[7498,601],[7499,7500,"R",-6896],[7501,103],[7503,107],[7504,109],[7505,331],[7506,111],[7507,596],[7508,7509,"R",-62],[7510,112],[7511,7512,"R",-7395],[7513,7453],[7514,623],[7515,118],[7516,7461],[7517,7519,"R",-6571],[7520,7521,"R",-6554],[7522,105],[7523,114],[7524,7525,"R",-7407],[7526,7527,"R",-6580],[7528,961],[7529,7530,"R",-6563],[7544,1085],[7579,594],[7580,99],[7581,597],[7582,240],[7583,604],[7584,102],[7585,607],[7586,
609],[7587,613],[7588,7590,"R",-6972],[7591,7547],[7592,669],[7593,621],[7594,7557],[7595,671],[7596,625],[7597,624],[7598,7601,"R",-6972],[7602,632],[7603,7604,"R",-6961],[7605,427],[7606,7607,"R",-6957],[7608,7452],[7609,7610,"R",-6958],[7611,122],[7612,7614,"R",-6956],[7615,952],[7680,7681,"A",97],[7682,7687,"A",98],[7688,7689,"A",231],[7690,7699,"A",100],[7700,7703,"A",275],[7704,7707,"A",101],[7708,7709,"A",553],[7710,7711,"A",102],[7712,7713,"A",103],[7714,7723,"A",104],[7724,7725,"A",105],
[7726,7727,"A",239],[7728,7733,"A",107],[7734,7735,"A",108],[7736,7737,"A",7735],[7738,7741,"A",108],[7742,7747,"A",109],[7748,7755,"A",110],[7756,7759,"A",245],[7760,7763,"A",333],[7764,7767,"A",112],[7768,7771,"A",114],[7772,7773,"A",7771],[7774,7775,"A",114],[7776,7779,"A",115],[7780,7781,"A",347],[7782,7783,"A",353],[7784,7785,"A",7779],[7786,7793,"A",116],[7794,7799,"A",117],[7800,7801,"A",361],[7802,7803,"A",363],[7804,7807,"A",118],[7808,7817,"A",119],[7818,7821,"A",120],[7822,7823,"A",121],
[7824,7829,"A",122],[7830,104],[7831,116],[7832,119],[7833,121],[7834,[97,702]],[7835,383],[7838,223],[7840,7843,"A",97],[7844,7851,"A",226],[7852,7853,"A",7841],[7854,7861,"A",259],[7862,7863,"A",7841],[7864,7869,"A",101],[7870,7877,"A",234],[7878,7879,"A",7865],[7880,7883,"A",105],[7884,7887,"A",111],[7888,7895,"A",244],[7896,7897,"A",7885],[7898,7907,"A",417],[7908,7911,"A",117],[7912,7921,"A",432],[7922,7929,"A",121],[7930,7934,"R",1],[7936,7937,"A",945],[7938,7939,"R",-2],[7940,7941,"R",-4],
[7942,7943,"R",-6],[7944,7945,"A",945],[7946,7947,"R",-10],[7948,7949,"R",-12],[7950,7951,"R",-14],[7952,7953,"A",949],[7954,7955,"R",-2],[7956,7957,"R",-4],[7960,7961,"A",949],[7962,7963,"R",-10],[7964,7965,"R",-12],[7968,7969,"A",951],[7970,7971,"R",-2],[7972,7973,"R",-4],[7974,7975,"R",-6],[7976,7977,"A",951],[7978,7979,"R",-10],[7980,7981,"R",-12],[7982,7983,"R",-14],[7984,7985,"A",953],[7986,7987,"R",-2],[7988,7989,"R",-4],[7990,7991,"R",-6],[7992,7993,"A",953],[7994,7995,"R",-10],[7996,7997,
"R",-12],[7998,7999,"R",-14],[8E3,8001,"A",959],[8002,8003,"R",-2],[8004,8005,"R",-4],[8008,8009,"A",959],[8010,8011,"R",-10],[8012,8013,"R",-12],[8016,8017,"A",965],[8018,8019,"R",-2],[8020,8021,"R",-4],[8022,8023,"R",-6],[8025,965],[8027,8031,"A",8017],[8032,8033,"A",969],[8034,8035,"R",-2],[8036,8037,"R",-4],[8038,8039,"R",-6],[8040,8041,"A",969],[8042,8043,"R",-10],[8044,8045,"R",-12],[8046,8047,"R",-14],[8048,945],[8049,940],[8050,949],[8051,941],[8052,951],[8053,942],[8054,953],[8055,943],[8056,
959],[8057,972],[8058,965],[8059,973],[8060,969],[8061,974],[8064,8071,"R",-128],[8072,8079,"R",-136],[8080,8087,"R",-112],[8088,8095,"R",-120],[8096,8103,"R",-64],[8104,8111,"R",-72],[8112,8113,"A",945],[8114,8048],[8115,945],[8116,940],[8118,945],[8119,8118],[8120,8122,"A",945],[8123,940],[8124,945],[8125,32],[8126,953],[8127,8128,"A",32],[8129,168],[8130,8052],[8131,951],[8132,942],[8134,951],[8135,8134],[8136,949],[8137,941],[8138,951],[8139,942],[8140,951],[8141,8143,"A",8127],[8144,8145,"A",
953],[8146,970],[8147,912],[8150,953],[8151,970],[8152,8154,"A",953],[8155,943],[8157,8159,"A",8190],[8160,8161,"A",965],[8162,971],[8163,944],[8164,8165,"A",961],[8166,965],[8167,971],[8168,8170,"A",965],[8171,973],[8172,961],[8173,168],[8174,901],[8175,96],[8178,8060],[8179,969],[8180,974],[8182,969],[8183,8182],[8184,959],[8185,972],[8186,969],[8187,974],[8188,969],[8189,180],[8190,32],[8192,8193,"R",2],[8194,8202,"A",32],[8209,8208],[8215,32],[8228,46],[8229,[46,46]],[8230,[46,46,46]],[8239,32],
[8243,[8242,8242]],[8244,[8242,8242,8242]],[8246,[8245,8245]],[8247,[8245,8245,8245]],[8252,[33,33]],[8254,32],[8263,[63,63]],[8264,[63,33]],[8265,[33,63]],[8279,[8242,8242,8242,8242]],[8287,32],[8304,48],[8305,105],[8308,8313,"R",-8256],[8314,43],[8315,8722],[8316,61],[8317,8318,"R",-8277],[8319,110],[8320,8329,"R",-8272],[8330,43],[8331,8722],[8332,61],[8333,8334,"R",-8293],[8336,97],[8337,101],[8338,111],[8339,120],[8340,601],[8341,104],[8342,8345,"R",-8235],[8346,112],[8347,8348,"R",-8232],[8360,
[82,115]],[8448,[97,47,99]],[8449,[97,47,115]],[8450,67],[8451,[176,67]],[8453,[99,47,111]],[8454,[99,47,117]],[8455,400],[8457,[176,70]],[8458,103],[8459,8461,"A",72],[8462,104],[8463,295],[8464,8465,"A",73],[8466,76],[8467,108],[8469,78],[8470,[78,111]],[8473,8475,"R",-8393],[8476,8477,"A",82],[8480,[83,77]],[8481,[84,69,76]],[8482,[84,77]],[8484,90],[8486,969],[8488,90],[8490,107],[8491,97],[8492,8493,"R",-8426],[8495,101],[8496,8497,"R",-8427],[8498,8526],[8499,77],[8500,111],[8501,8504,"R",-7013],
[8505,105],[8507,[70,65,88]],[8508,960],[8509,947],[8510,915],[8511,928],[8512,8721],[8517,68],[8518,8519,"R",-8418],[8520,8521,"R",-8415],[8528,[49,8260,55]],[8529,[49,8260,57]],[8530,[49,8260,49,48]],[8531,[49,8260,51]],[8532,[50,8260,51]],[8533,[49,8260,53]],[8534,[50,8260,53]],[8535,[51,8260,53]],[8536,[52,8260,53]],[8537,[49,8260,54]],[8538,[53,8260,54]],[8539,[49,8260,56]],[8540,[51,8260,56]],[8541,[53,8260,56]],[8542,[55,8260,56]],[8543,[49,8260]],[8544,105],[8545,[105,105]],[8546,[105,105,
105]],[8547,[105,118]],[8548,118],[8549,[118,105]],[8550,[118,105,105]],[8551,[118,105,105,105]],[8552,[105,120]],[8553,120],[8554,[120,105]],[8555,[120,105,105]],[8556,108],[8557,8558,"R",-8458],[8559,109],[8560,105],[8561,[105,105]],[8562,[105,105,105]],[8563,[105,118]],[8564,118],[8565,[118,105]],[8566,[118,105,105]],[8567,[118,105,105,105]],[8568,[105,120]],[8569,120],[8570,[120,105]],[8571,[120,105,105]],[8572,108],[8573,8574,"R",-8474],[8575,109],[8579,8580],[8585,[48,8260,51]],[8602,8592],
[8603,8594],[8622,8596],[8653,8656],[8654,8660],[8655,8658],[8708,8742,"R",-1],[8748,[8747,8747]],[8749,[8747,8747,8747]],[8751,[8750,8750]],[8752,[8750,8750,8750]],[8769,8764],[8772,8771],[8775,8773],[8777,8776],[8800,61],[8802,8801],[8813,8781],[8814,60],[8815,62],[8816,8817,"R",-12],[8820,8825,"R",-2],[8832,8833,"R",-6],[8836,8841,"R",-2],[8876,8866],[8877,8878,"R",-5],[8879,8875],[8928,8929,"R",-100],[8930,8931,"R",-81],[8938,8941,"R",-56],[9001,9002,"R",3295],[9312,9320,"R",-9263],[9321,[49,
48]],[9322,[49,49]],[9323,[49,50]],[9324,[49,51]],[9325,[49,52]],[9326,[49,53]],[9327,[49,54]],[9328,[49,55]],[9329,[49,56]],[9330,[49,57]],[9331,[50,48]],[9332,[40,49,41]],[9333,[40,50,41]],[9334,[40,51,41]],[9335,[40,52,41]],[9336,[40,53,41]],[9337,[40,54,41]],[9338,[40,55,41]],[9339,[40,56,41]],[9340,[40,57,41]],[9341,[40,49,48,41]],[9342,[40,49,49,41]],[9343,[40,49,50,41]],[9344,[40,49,51,41]],[9345,[40,49,52,41]],[9346,[40,49,53,41]],[9347,[40,49,54,41]],[9348,[40,49,55,41]],[9349,[40,49,56,
41]],[9350,[40,49,57,41]],[9351,[40,50,48,41]],[9352,[49,46]],[9353,[50,46]],[9354,[51,46]],[9355,[52,46]],[9356,[53,46]],[9357,[54,46]],[9358,[55,46]],[9359,[56,46]],[9360,[57,46]],[9361,[49,48,46]],[9362,[49,49,46]],[9363,[49,50,46]],[9364,[49,51,46]],[9365,[49,52,46]],[9366,[49,53,46]],[9367,[49,54,46]],[9368,[49,55,46]],[9369,[49,56,46]],[9370,[49,57,46]],[9371,[50,48,46]],[9372,[40,97,41]],[9373,[40,98,41]],[9374,[40,99,41]],[9375,[40,100,41]],[9376,[40,101,41]],[9377,[40,102,41]],[9378,[40,
103,41]],[9379,[40,104,41]],[9380,[40,105,41]],[9381,[40,106,41]],[9382,[40,107,41]],[9383,[40,108,41]],[9384,[40,109,41]],[9385,[40,110,41]],[9386,[40,111,41]],[9387,[40,112,41]],[9388,[40,113,41]],[9389,[40,114,41]],[9390,[40,115,41]],[9391,[40,116,41]],[9392,[40,117,41]],[9393,[40,118,41]],[9394,[40,119,41]],[9395,[40,120,41]],[9396,[40,121,41]],[9397,[40,122,41]],[9398,9423,"R",-9301],[9424,9449,"R",-9327],[9450,48],[10764,[8747,8747,8747,8747]],[10868,[58,58,61]],[10869,[61,61]],[10870,[61,61,
61]],[10972,10973],[11264,11310,"R",48],[11360,11361],[11362,619],[11363,7549],[11364,637],[11367,11371,"R",1],[11373,593],[11374,625],[11375,592],[11376,594],[11378,11381,"R",1],[11388,106],[11389,86],[11390,11391,"R",-10815],[11392,11506,"R",1],[11631,11617],[11935,12019,"R",0],[12032,19968],[12033,12245,"R",0],[12288,32],[12342,12306],[12344,12346,"R",0],[12364,12400,"R",-1],[12401,12399],[12403,12404,"A",12402],[12406,12407,"A",12405],[12409,12410,"A",12408],[12412,12413,"A",12411],[12436,12358],
[12443,12444,"A",32],[12446,12445],[12447,[12424,12426]],[12460,12496,"R",-1],[12497,12495],[12499,12500,"A",12498],[12502,12503,"A",12501],[12505,12506,"A",12504],[12508,12509,"A",12507],[12532,12454],[12535,12538,"R",-8],[12542,12541],[12543,[12467,12488]],[12593,12594,"R",-8241],[12595,4522],[12596,4354],[12597,12598,"R",-8073],[12599,12601,"R",-8244],[12602,12607,"R",-8074],[12608,4378],[12609,12611,"R",-8251],[12612,4385],[12613,12622,"R",-8252],[12623,12643,"R",-8174],[12644,4448],[12645,12646,
"R",-8273],[12647,12648,"R",-8096],[12649,4556],[12650,4558],[12651,4563],[12652,4567],[12653,4569],[12654,4380],[12655,4573],[12656,4575],[12657,12658,"R",-8276],[12659,4384],[12660,12661,"R",-8274],[12662,4391],[12663,4393],[12664,12668,"R",-8269],[12669,4402],[12670,4406],[12671,4416],[12672,4423],[12673,4428],[12674,12675,"R",-8081],[12676,12678,"R",-8237],[12679,12680,"R",-8195],[12681,4488],[12682,12683,"R",-8185],[12684,4500],[12685,4510],[12686,4513],[12690,19968],[12691,12703,"R",0],[12800,
[40,4352,41]],[12801,[40,4354,41]],[12802,[40,4355,41]],[12803,[40,4357,41]],[12804,[40,4358,41]],[12805,[40,4359,41]],[12806,[40,4361,41]],[12807,[40,4363,41]],[12808,[40,4364,41]],[12809,[40,4366,41]],[12810,[40,4367,41]],[12811,[40,4368,41]],[12812,[40,4369,41]],[12813,[40,4370,41]],[12814,[40,4352,4449,41]],[12815,[40,4354,4449,41]],[12816,[40,4355,4449,41]],[12817,[40,4357,4449,41]],[12818,[40,4358,4449,41]],[12819,[40,4359,4449,41]],[12820,[40,4361,4449,41]],[12821,[40,4363,4449,41]],[12822,
[40,4364,4449,41]],[12823,[40,4366,4449,41]],[12824,[40,4367,4449,41]],[12825,[40,4368,4449,41]],[12826,[40,4369,4449,41]],[12827,[40,4370,4449,41]],[12828,[40,4364,4462,41]],[12829,[40,4363,4457,4364,4453,4523,41]],[12830,[40,4363,4457,4370,4462,41]],[12832,[40,19968,41]],[12833,[40,41]],[12834,[40,41]],[12835,[40,41]],[12836,[40,41]],[12837,[40,41]],[12838,[40,41]],[12839,[40,41]],[12840,[40,41]],[12841,[40,41]],[12842,[40,41]],[12843,[40,41]],[12844,[40,41]],[12845,[40,41]],[12846,[40,41]],[12847,
[40,41]],[12848,[40,41]],[12849,[40,41]],[12850,[40,41]],[12851,[40,41]],[12852,[40,41]],[12853,[40,41]],[12854,[40,41]],[12855,[40,41]],[12856,[40,41]],[12857,[40,41]],[12858,[40,41]],[12859,[40,41]],[12860,[40,41]],[12861,[40,41]],[12862,[40,41]],[12863,[40,41]],[12864,[40,41]],[12865,[40,41]],[12866,[40,41]],[12867,[40,41]],[12868,12871,"R",0],[12880,[80,84,69]],[12881,[50,49]],[12882,[50,50]],[12883,[50,51]],[12884,[50,52]],[12885,[50,53]],[12886,[50,54]],[12887,[50,55]],[12888,[50,56]],[12889,
[50,57]],[12890,[51,48]],[12891,[51,49]],[12892,[51,50]],[12893,[51,51]],[12894,[51,52]],[12895,[51,53]],[12896,4352],[12897,12898,"R",-8543],[12899,12901,"R",-8542],[12902,4361],[12903,12904,"R",-8540],[12905,12909,"R",-8539],[12910,[4352,4449]],[12911,[4354,4449]],[12912,[4355,4449]],[12913,[4357,4449]],[12914,[4358,4449]],[12915,[4359,4449]],[12916,[4361,4449]],[12917,[4363,4449]],[12918,[4364,4449]],[12919,[4366,4449]],[12920,[4367,4449]],[12921,[4368,4449]],[12922,[4369,4449]],[12923,[4370,4449]],
[12924,[4366,4449,4535,4352,4457]],[12925,[4364,4462,4363,4468]],[12926,[4363,4462]],[12928,19968],[12929,12976,"R",0],[12977,[51,54]],[12978,[51,55]],[12979,[51,56]],[12980,[51,57]],[12981,[52,48]],[12982,[52,49]],[12983,[52,50]],[12984,[52,51]],[12985,[52,52]],[12986,[52,53]],[12987,[52,54]],[12988,[52,55]],[12989,[52,56]],[12990,[52,57]],[12991,[53,48]],[12992,13E3,"R",-12943],[13001,[49,48]],[13002,[49,49]],[13003,[49,50]],[13004,[72,103]],[13005,[101,114,103]],[13006,[101,86]],[13007,[76,84,
68]],[13008,12450],[13009,12452],[13010,12454],[13011,12456],[13012,13013,"R",-554],[13014,12461],[13015,12463],[13016,12465],[13017,12467],[13018,12469],[13019,12471],[13020,12473],[13021,12475],[13022,12477],[13023,12479],[13024,12481],[13025,12484],[13026,12486],[13027,12488],[13028,13033,"R",-538],[13034,12498],[13035,12501],[13036,12504],[13037,12507],[13038,13042,"R",-528],[13043,12516],[13044,12518],[13045,13050,"R",-525],[13051,13054,"R",-524],[13056,[12450,12497,12540,12488]],[13057,[12450,
12523,12501,12449]],[13058,[12450,12531,12506,12450]],[13059,[12450,12540,12523]],[13060,[12452,12491,12531,12464]],[13061,[12452,12531,12481]],[13062,[12454,12457,12531]],[13063,[12456,12473,12463,12540,12489]],[13064,[12456,12540,12459,12540]],[13065,[12458,12531,12473]],[13066,[12458,12540,12512]],[13067,[12459,12452,12522]],[13068,[12459,12521,12483,12488]],[13069,[12459,12525,12522,12540]],[13070,[12460,12525,12531]],[13071,[12460,12531,12510]],[13072,[12462,12460]],[13073,[12462,12491,12540]],
[13074,[12461,12517,12522,12540]],[13075,[12462,12523,12480,12540]],[13076,[12461,12525]],[13077,[12461,12525,12464,12521,12512]],[13078,[12461,12525,12513,12540,12488,12523]],[13079,[12461,12525,12527,12483,12488]],[13080,[12464,12521,12512]],[13081,[12464,12521,12512,12488,12531]],[13082,[12463,12523,12476,12452,12525]],[13083,[12463,12525,12540,12493]],[13084,[12465,12540,12473]],[13085,[12467,12523,12490]],[13086,[12467,12540,12509]],[13087,[12469,12452,12463,12523]],[13088,[12469,12531,12481,
12540,12512]],[13089,[12471,12522,12531,12464]],[13090,[12475,12531,12481]],[13091,[12475,12531,12488]],[13092,[12480,12540,12473]],[13093,[12487,12471]],[13094,[12489,12523]],[13095,[12488,12531]],[13096,[12490,12494]],[13097,[12494,12483,12488]],[13098,[12495,12452,12484]],[13099,[12497,12540,12475,12531,12488]],[13100,[12497,12540,12484]],[13101,[12496,12540,12524,12523]],[13102,[12500,12450,12473,12488,12523]],[13103,[12500,12463,12523]],[13104,[12500,12467]],[13105,[12499,12523]],[13106,[12501,
12449,12521,12483,12489]],[13107,[12501,12451,12540,12488]],[13108,[12502,12483,12471,12455,12523]],[13109,[12501,12521,12531]],[13110,[12504,12463,12479,12540,12523]],[13111,[12506,12477]],[13112,[12506,12491,12498]],[13113,[12504,12523,12484]],[13114,[12506,12531,12473]],[13115,[12506,12540,12472]],[13116,[12505,12540,12479]],[13117,[12509,12452,12531,12488]],[13118,[12508,12523,12488]],[13119,[12507,12531]],[13120,[12509,12531,12489]],[13121,[12507,12540,12523]],[13122,[12507,12540,12531]],[13123,
[12510,12452,12463,12525]],[13124,[12510,12452,12523]],[13125,[12510,12483,12495]],[13126,[12510,12523,12463]],[13127,[12510,12531,12471,12519,12531]],[13128,[12511,12463,12525,12531]],[13129,[12511,12522]],[13130,[12511,12522,12496,12540,12523]],[13131,[12513,12460]],[13132,[12513,12460,12488,12531]],[13133,[12513,12540,12488,12523]],[13134,[12516,12540,12489]],[13135,[12516,12540,12523]],[13136,[12518,12450,12531]],[13137,[12522,12483,12488,12523]],[13138,[12522,12521]],[13139,[12523,12500,12540]],
[13140,[12523,12540,12502,12523]],[13141,[12524,12512]],[13142,[12524,12531,12488,12466,12531]],[13143,[12527,12483,12488]],[13144,13153,"R",-13096],[13154,[49,48]],[13155,[49,49]],[13156,[49,50]],[13157,[49,51]],[13158,[49,52]],[13159,[49,53]],[13160,[49,54]],[13161,[49,55]],[13162,[49,56]],[13163,[49,57]],[13164,[50,48]],[13165,[50,49]],[13166,[50,50]],[13167,[50,51]],[13168,[50,52]],[13169,[104,80,97]],[13170,[100,97]],[13171,[65,85]],[13172,[98,97,114]],[13173,[111,86]],[13174,[112,99]],[13175,
[100,109]],[13176,[100,109,178]],[13177,[100,109,179]],[13178,[73,85]],[13179,13183,"R",0],[13184,[112,65]],[13185,[110,65]],[13186,[956,65]],[13187,[109,65]],[13188,[107,65]],[13189,[75,66]],[13190,[77,66]],[13191,[71,66]],[13192,[99,97,108]],[13193,[107,99,97,108]],[13194,[112,70]],[13195,[110,70]],[13196,[956,70]],[13197,[956,103]],[13198,[109,103]],[13199,[107,103]],[13200,[72,122]],[13201,[107,72,122]],[13202,[77,72,122]],[13203,[71,72,122]],[13204,[84,72,122]],[13205,[956,8467]],[13206,[109,
8467]],[13207,[100,8467]],[13208,[107,8467]],[13209,[102,109]],[13210,[110,109]],[13211,[956,109]],[13212,[109,109]],[13213,[99,109]],[13214,[107,109]],[13215,[109,109,178]],[13216,[99,109,178]],[13217,[109,178]],[13218,[107,109,178]],[13219,[109,109,179]],[13220,[99,109,179]],[13221,[109,179]],[13222,[107,109,179]],[13223,[109,8725,115]],[13224,[109,8725,115,178]],[13225,[80,97]],[13226,[107,80,97]],[13227,[77,80,97]],[13228,[71,80,97]],[13229,[114,97,100]],[13230,[114,97,100,8725,115]],[13231,[114,
97,100,8725,115,178]],[13232,[112,115]],[13233,[110,115]],[13234,[956,115]],[13235,[109,115]],[13236,[112,86]],[13237,[110,86]],[13238,[956,86]],[13239,[109,86]],[13240,[107,86]],[13241,[77,86]],[13242,[112,87]],[13243,[110,87]],[13244,[956,87]],[13245,[109,87]],[13246,[107,87]],[13247,[77,87]],[13248,[107,937]],[13249,[77,937]],[13250,[97,46,109,46]],[13251,[66,113]],[13252,[99,99]],[13253,[99,100]],[13254,[67,8725,107,103]],[13255,[67,111,46]],[13256,[100,66]],[13257,[71,121]],[13258,[104,97]],
[13259,[72,80]],[13260,[105,110]],[13261,[75,75]],[13262,[75,77]],[13263,[107,116]],[13264,[108,109]],[13265,[108,110]],[13266,[108,111,103]],[13267,[108,120]],[13268,[109,98]],[13269,[109,105,108]],[13270,[109,111,108]],[13271,[80,72]],[13272,[112,46,109,46]],[13273,[80,80,77]],[13274,[80,82]],[13275,[115,114]],[13276,[83,118]],[13277,[87,98]],[13278,[86,8725,109]],[13279,[65,8725,109]],[13280,13288,"R",-13231],[13289,[49,48]],[13290,[49,49]],[13291,[49,50]],[13292,[49,51]],[13293,[49,52]],[13294,
[49,53]],[13295,[49,54]],[13296,[49,55]],[13297,[49,56]],[13298,[49,57]],[13299,[50,48]],[13300,[50,49]],[13301,[50,50]],[13302,[50,51]],[13303,[50,52]],[13304,[50,53]],[13305,[50,54]],[13306,[50,55]],[13307,[50,56]],[13308,[50,57]],[13309,[51,48]],[13310,[51,49]],[13311,[103,97,108]],[42560,42862,"R",1],[42864,42863],[42873,42875,"R",1],[42877,7545],[42878,42891,"R",1],[42893,613],[42896,42920,"R",1],[42922,614],[43E3,294],[43001,339],[63744,64217,"R",0],[64256,[102,102]],[64257,[102,105]],[64258,
[102,108]],[64259,[102,102,105]],[64260,[102,102,108]],[64261,[383,116]],[64262,[115,116]],[64275,[1396,1398]],[64276,[1396,1381]],[64277,[1396,1387]],[64278,[1406,1398]],[64279,[1396,1389]],[64285,1497],[64287,1522],[64288,1506],[64289,1488],[64290,64291,"R",-62799],[64292,64294,"R",-62793],[64295,1512],[64296,1514],[64297,43],[64298,64299,"A",1513],[64300,64301,"A",64329],[64302,64304,"A",1488],[64305,64330,"R",-62816],[64331,1493],[64332,1489],[64333,1499],[64334,1508],[64335,[1488,1500]],[64336,
64337,"A",1649],[64338,64341,"A",1659],[64342,64345,"A",1662],[64346,64349,"A",1664],[64350,64353,"A",1658],[64354,64357,"A",1663],[64358,64361,"A",1657],[64362,64365,"A",1700],[64366,64369,"A",1702],[64370,64373,"A",1668],[64374,64377,"A",1667],[64378,64381,"A",1670],[64382,64385,"A",1671],[64386,64387,"A",1677],[64388,64389,"A",1676],[64390,64391,"A",1678],[64392,64393,"A",1672],[64394,64395,"A",1688],[64396,64397,"A",1681],[64398,64401,"A",1705],[64402,64405,"A",1711],[64406,64409,"A",1715],[64410,
64413,"A",1713],[64414,64415,"A",1722],[64416,64419,"A",1723],[64420,64421,"A",1728],[64422,64425,"A",1729],[64426,64429,"A",1726],[64430,64431,"A",1746],[64432,64433,"A",1747],[64467,64470,"A",1709],[64471,64472,"A",1735],[64473,64474,"A",1734],[64475,64476,"A",1736],[64477,1655],[64478,64479,"A",1739],[64480,64481,"A",1733],[64482,64483,"A",1737],[64484,64487,"A",1744],[64488,64489,"A",1609],[64490,[1574,1575]],[64491,[1574,1575]],[64492,[1574,1749]],[64493,[1574,1749]],[64494,[1574,1608]],[64495,
[1574,1608]],[64496,[1574,1735]],[64497,[1574,1735]],[64498,[1574,1734]],[64499,[1574,1734]],[64500,[1574,1736]],[64501,[1574,1736]],[64502,[1574,1744]],[64503,[1574,1744]],[64504,[1574,1744]],[64505,[1574,1609]],[64506,[1574,1609]],[64507,[1574,1609]],[64508,64511,"A",1740],[64512,[1574,1580]],[64513,[1574,1581]],[64514,[1574,1605]],[64515,[1574,1609]],[64516,[1574,1610]],[64517,[1576,1580]],[64518,[1576,1581]],[64519,[1576,1582]],[64520,[1576,1605]],[64521,[1576,1609]],[64522,[1576,1610]],[64523,
[1578,1580]],[64524,[1578,1581]],[64525,[1578,1582]],[64526,[1578,1605]],[64527,[1578,1609]],[64528,[1578,1610]],[64529,[1579,1580]],[64530,[1579,1605]],[64531,[1579,1609]],[64532,[1579,1610]],[64533,[1580,1581]],[64534,[1580,1605]],[64535,[1581,1580]],[64536,[1581,1605]],[64537,[1582,1580]],[64538,[1582,1581]],[64539,[1582,1605]],[64540,[1587,1580]],[64541,[1587,1581]],[64542,[1587,1582]],[64543,[1587,1605]],[64544,[1589,1581]],[64545,[1589,1605]],[64546,[1590,1580]],[64547,[1590,1581]],[64548,[1590,
1582]],[64549,[1590,1605]],[64550,[1591,1581]],[64551,[1591,1605]],[64552,[1592,1605]],[64553,[1593,1580]],[64554,[1593,1605]],[64555,[1594,1580]],[64556,[1594,1605]],[64557,[1601,1580]],[64558,[1601,1581]],[64559,[1601,1582]],[64560,[1601,1605]],[64561,[1601,1609]],[64562,[1601,1610]],[64563,[1602,1581]],[64564,[1602,1605]],[64565,[1602,1609]],[64566,[1602,1610]],[64567,[1603,1575]],[64568,[1603,1580]],[64569,[1603,1581]],[64570,[1603,1582]],[64571,[1603,1604]],[64572,[1603,1605]],[64573,[1603,1609]],
[64574,[1603,1610]],[64575,[1604,1580]],[64576,[1604,1581]],[64577,[1604,1582]],[64578,[1604,1605]],[64579,[1604,1609]],[64580,[1604,1610]],[64581,[1605,1580]],[64582,[1605,1581]],[64583,[1605,1582]],[64584,[1605,1605]],[64585,[1605,1609]],[64586,[1605,1610]],[64587,[1606,1580]],[64588,[1606,1581]],[64589,[1606,1582]],[64590,[1606,1605]],[64591,[1606,1609]],[64592,[1606,1610]],[64593,[1607,1580]],[64594,[1607,1605]],[64595,[1607,1609]],[64596,[1607,1610]],[64597,[1610,1580]],[64598,[1610,1581]],[64599,
[1610,1582]],[64600,[1610,1605]],[64601,[1610,1609]],[64602,[1610,1610]],[64603,64604,"R",-63019],[64605,1609],[64606,64611,"A",32],[64612,[1574,1585]],[64613,[1574,1586]],[64614,[1574,1605]],[64615,[1574,1606]],[64616,[1574,1609]],[64617,[1574,1610]],[64618,[1576,1585]],[64619,[1576,1586]],[64620,[1576,1605]],[64621,[1576,1606]],[64622,[1576,1609]],[64623,[1576,1610]],[64624,[1578,1585]],[64625,[1578,1586]],[64626,[1578,1605]],[64627,[1578,1606]],[64628,[1578,1609]],[64629,[1578,1610]],[64630,[1579,
1585]],[64631,[1579,1586]],[64632,[1579,1605]],[64633,[1579,1606]],[64634,[1579,1609]],[64635,[1579,1610]],[64636,[1601,1609]],[64637,[1601,1610]],[64638,[1602,1609]],[64639,[1602,1610]],[64640,[1603,1575]],[64641,[1603,1604]],[64642,[1603,1605]],[64643,[1603,1609]],[64644,[1603,1610]],[64645,[1604,1605]],[64646,[1604,1609]],[64647,[1604,1610]],[64648,[1605,1575]],[64649,[1605,1605]],[64650,[1606,1585]],[64651,[1606,1586]],[64652,[1606,1605]],[64653,[1606,1606]],[64654,[1606,1609]],[64655,[1606,1610]],
[64656,1609],[64657,[1610,1585]],[64658,[1610,1586]],[64659,[1610,1605]],[64660,[1610,1606]],[64661,[1610,1609]],[64662,[1610,1610]],[64663,[1574,1580]],[64664,[1574,1581]],[64665,[1574,1582]],[64666,[1574,1605]],[64667,[1574,1607]],[64668,[1576,1580]],[64669,[1576,1581]],[64670,[1576,1582]],[64671,[1576,1605]],[64672,[1576,1607]],[64673,[1578,1580]],[64674,[1578,1581]],[64675,[1578,1582]],[64676,[1578,1605]],[64677,[1578,1607]],[64678,[1579,1605]],[64679,[1580,1581]],[64680,[1580,1605]],[64681,[1581,
1580]],[64682,[1581,1605]],[64683,[1582,1580]],[64684,[1582,1605]],[64685,[1587,1580]],[64686,[1587,1581]],[64687,[1587,1582]],[64688,[1587,1605]],[64689,[1589,1581]],[64690,[1589,1582]],[64691,[1589,1605]],[64692,[1590,1580]],[64693,[1590,1581]],[64694,[1590,1582]],[64695,[1590,1605]],[64696,[1591,1581]],[64697,[1592,1605]],[64698,[1593,1580]],[64699,[1593,1605]],[64700,[1594,1580]],[64701,[1594,1605]],[64702,[1601,1580]],[64703,[1601,1581]],[64704,[1601,1582]],[64705,[1601,1605]],[64706,[1602,1581]],
[64707,[1602,1605]],[64708,[1603,1580]],[64709,[1603,1581]],[64710,[1603,1582]],[64711,[1603,1604]],[64712,[1603,1605]],[64713,[1604,1580]],[64714,[1604,1581]],[64715,[1604,1582]],[64716,[1604,1605]],[64717,[1604,1607]],[64718,[1605,1580]],[64719,[1605,1581]],[64720,[1605,1582]],[64721,[1605,1605]],[64722,[1606,1580]],[64723,[1606,1581]],[64724,[1606,1582]],[64725,[1606,1605]],[64726,[1606,1607]],[64727,[1607,1580]],[64728,[1607,1605]],[64729,1607],[64730,[1610,1580]],[64731,[1610,1581]],[64732,[1610,
1582]],[64733,[1610,1605]],[64734,[1610,1607]],[64735,[1574,1605]],[64736,[1574,1607]],[64737,[1576,1605]],[64738,[1576,1607]],[64739,[1578,1605]],[64740,[1578,1607]],[64741,[1579,1605]],[64742,[1579,1607]],[64743,[1587,1605]],[64744,[1587,1607]],[64745,[1588,1605]],[64746,[1588,1607]],[64747,[1603,1604]],[64748,[1603,1605]],[64749,[1604,1605]],[64750,[1606,1605]],[64751,[1606,1607]],[64752,[1610,1605]],[64753,[1610,1607]],[64754,64756,"A",1600],[64757,[1591,1609]],[64758,[1591,1610]],[64759,[1593,
1609]],[64760,[1593,1610]],[64761,[1594,1609]],[64762,[1594,1610]],[64763,[1587,1609]],[64764,[1587,1610]],[64765,[1588,1609]],[64766,[1588,1610]],[64767,[1581,1609]],[64768,[1581,1610]],[64769,[1580,1609]],[64770,[1580,1610]],[64771,[1582,1609]],[64772,[1582,1610]],[64773,[1589,1609]],[64774,[1589,1610]],[64775,[1590,1609]],[64776,[1590,1610]],[64777,[1588,1580]],[64778,[1588,1581]],[64779,[1588,1582]],[64780,[1588,1605]],[64781,[1588,1585]],[64782,[1587,1585]],[64783,[1589,1585]],[64784,[1590,1585]],
[64785,[1591,1609]],[64786,[1591,1610]],[64787,[1593,1609]],[64788,[1593,1610]],[64789,[1594,1609]],[64790,[1594,1610]],[64791,[1587,1609]],[64792,[1587,1610]],[64793,[1588,1609]],[64794,[1588,1610]],[64795,[1581,1609]],[64796,[1581,1610]],[64797,[1580,1609]],[64798,[1580,1610]],[64799,[1582,1609]],[64800,[1582,1610]],[64801,[1589,1609]],[64802,[1589,1610]],[64803,[1590,1609]],[64804,[1590,1610]],[64805,[1588,1580]],[64806,[1588,1581]],[64807,[1588,1582]],[64808,[1588,1605]],[64809,[1588,1585]],[64810,
[1587,1585]],[64811,[1589,1585]],[64812,[1590,1585]],[64813,[1588,1580]],[64814,[1588,1581]],[64815,[1588,1582]],[64816,[1588,1605]],[64817,[1587,1607]],[64818,[1588,1607]],[64819,[1591,1605]],[64820,[1587,1580]],[64821,[1587,1581]],[64822,[1587,1582]],[64823,[1588,1580]],[64824,[1588,1581]],[64825,[1588,1582]],[64826,[1591,1605]],[64827,[1592,1605]],[64828,64829,"A",1575],[64848,[1578,1580,1605]],[64849,[1578,1581,1580]],[64850,[1578,1581,1580]],[64851,[1578,1581,1605]],[64852,[1578,1582,1605]],
[64853,[1578,1605,1580]],[64854,[1578,1605,1581]],[64855,[1578,1605,1582]],[64856,[1580,1605,1581]],[64857,[1580,1605,1581]],[64858,[1581,1605,1610]],[64859,[1581,1605,1609]],[64860,[1587,1581,1580]],[64861,[1587,1580,1581]],[64862,[1587,1580,1609]],[64863,[1587,1605,1581]],[64864,[1587,1605,1581]],[64865,[1587,1605,1580]],[64866,[1587,1605,1605]],[64867,[1587,1605,1605]],[64868,[1589,1581,1581]],[64869,[1589,1581,1581]],[64870,[1589,1605,1605]],[64871,[1588,1581,1605]],[64872,[1588,1581,1605]],[64873,
[1588,1580,1610]],[64874,[1588,1605,1582]],[64875,[1588,1605,1582]],[64876,[1588,1605,1605]],[64877,[1588,1605,1605]],[64878,[1590,1581,1609]],[64879,[1590,1582,1605]],[64880,[1590,1582,1605]],[64881,[1591,1605,1581]],[64882,[1591,1605,1581]],[64883,[1591,1605,1605]],[64884,[1591,1605,1610]],[64885,[1593,1580,1605]],[64886,[1593,1605,1605]],[64887,[1593,1605,1605]],[64888,[1593,1605,1609]],[64889,[1594,1605,1605]],[64890,[1594,1605,1610]],[64891,[1594,1605,1609]],[64892,[1601,1582,1605]],[64893,[1601,
1582,1605]],[64894,[1602,1605,1581]],[64895,[1602,1605,1605]],[64896,[1604,1581,1605]],[64897,[1604,1581,1610]],[64898,[1604,1581,1609]],[64899,[1604,1580,1580]],[64900,[1604,1580,1580]],[64901,[1604,1582,1605]],[64902,[1604,1582,1605]],[64903,[1604,1605,1581]],[64904,[1604,1605,1581]],[64905,[1605,1581,1580]],[64906,[1605,1581,1605]],[64907,[1605,1581,1610]],[64908,[1605,1580,1581]],[64909,[1605,1580,1605]],[64910,[1605,1582,1580]],[64911,[1605,1582,1605]],[64914,[1605,1580,1582]],[64915,[1607,1605,
1580]],[64916,[1607,1605,1605]],[64917,[1606,1581,1605]],[64918,[1606,1581,1609]],[64919,[1606,1580,1605]],[64920,[1606,1580,1605]],[64921,[1606,1580,1609]],[64922,[1606,1605,1610]],[64923,[1606,1605,1609]],[64924,[1610,1605,1605]],[64925,[1610,1605,1605]],[64926,[1576,1582,1610]],[64927,[1578,1580,1610]],[64928,[1578,1580,1609]],[64929,[1578,1582,1610]],[64930,[1578,1582,1609]],[64931,[1578,1605,1610]],[64932,[1578,1605,1609]],[64933,[1580,1605,1610]],[64934,[1580,1581,1609]],[64935,[1580,1605,1609]],
[64936,[1587,1582,1609]],[64937,[1589,1581,1610]],[64938,[1588,1581,1610]],[64939,[1590,1581,1610]],[64940,[1604,1580,1610]],[64941,[1604,1605,1610]],[64942,[1610,1581,1610]],[64943,[1610,1580,1610]],[64944,[1610,1605,1610]],[64945,[1605,1605,1610]],[64946,[1602,1605,1610]],[64947,[1606,1581,1610]],[64948,[1602,1605,1581]],[64949,[1604,1581,1605]],[64950,[1593,1605,1610]],[64951,[1603,1605,1610]],[64952,[1606,1580,1581]],[64953,[1605,1582,1610]],[64954,[1604,1580,1605]],[64955,[1603,1605,1605]],[64956,
[1604,1580,1605]],[64957,[1606,1580,1581]],[64958,[1580,1581,1610]],[64959,[1581,1580,1610]],[64960,[1605,1580,1610]],[64961,[1601,1605,1610]],[64962,[1576,1581,1610]],[64963,[1603,1605,1605]],[64964,[1593,1580,1605]],[64965,[1589,1605,1605]],[64966,[1587,1582,1610]],[64967,[1606,1580,1610]],[65008,[1589,1604,1746]],[65009,[1602,1604,1746]],[65010,[1575,1604,1604,1607]],[65011,[1575,1603,1576,1585]],[65012,[1605,1581,1605,1583]],[65013,[1589,1604,1593,1605]],[65014,[1585,1587,1608,1604]],[65015,[1593,
1604,1610,1607]],[65016,[1608,1587,1604,1605]],[65017,[1589,1604,1609]],[65018,[1589,1604,1609,32,1575,1604,1604,1607,32,1593,1604,1610,1607,32,1608,1587,1604,1605]],[65019,[1580,1604,32,1580,1604,1575,1604,1607]],[65020,[1585,1740,1575,1604]],[65040,44],[65041,65042,"R",-52752],[65043,65044,"R",-64985],[65045,33],[65046,63],[65047,65048,"R",-52737],[65049,8230],[65072,8229],[65073,8212],[65074,8211],[65075,65076,"A",95],[65077,65078,"R",-65037],[65079,123],[65080,125],[65081,65082,"R",-52773],[65083,
65084,"R",-52779],[65085,65086,"R",-52787],[65087,65088,"R",-52791],[65089,65092,"R",-52789],[65095,91],[65096,93],[65097,65100,"A",8254],[65101,65103,"A",95],[65104,44],[65105,12289],[65106,46],[65108,59],[65109,58],[65110,63],[65111,33],[65112,8212],[65113,65114,"R",-65073],[65115,123],[65116,125],[65117,65118,"R",-52809],[65119,35],[65120,38],[65121,65122,"R",-65079],[65123,45],[65124,60],[65125,62],[65126,61],[65128,92],[65129,65130,"R",-65093],[65131,64],[65136,32],[65137,1600],[65138,65142,
"A",32],[65143,1600],[65144,32],[65145,1600],[65146,32],[65147,1600],[65148,32],[65149,1600],[65150,32],[65151,1600],[65152,65153,"R",-63583],[65154,65155,"R",-63584],[65156,65157,"R",-63585],[65158,65159,"R",-63586],[65160,65161,"R",-63587],[65162,65164,"A",1574],[65165,65166,"A",1575],[65167,65170,"A",1576],[65171,65172,"A",1577],[65173,65176,"A",1578],[65177,65180,"A",1579],[65181,65184,"A",1580],[65185,65188,"A",1581],[65189,65192,"A",1582],[65193,65194,"A",1583],[65195,65196,"A",1584],[65197,
65198,"A",1585],[65199,65200,"A",1586],[65201,65204,"A",1587],[65205,65208,"A",1588],[65209,65212,"A",1589],[65213,65216,"A",1590],[65217,65220,"A",1591],[65221,65224,"A",1592],[65225,65228,"A",1593],[65229,65232,"A",1594],[65233,65236,"A",1601],[65237,65240,"A",1602],[65241,65244,"A",1603],[65245,65248,"A",1604],[65249,65252,"A",1605],[65253,65256,"A",1606],[65257,65260,"A",1607],[65261,65262,"A",1608],[65263,65264,"A",1609],[65265,65268,"A",1610],[65269,[1604,1570]],[65270,[1604,1570]],[65271,[1604,
1571]],[65272,[1604,1571]],[65273,[1604,1573]],[65274,[1604,1573]],[65275,[1604,1575]],[65276,[1604,1575]],[65281,65312,"R",-65248],[65313,65338,"R",-65216],[65339,65374,"R",-65248],[65375,65376,"R",-54746],[65377,12290],[65378,65379,"R",-53078],[65380,12289],[65381,12539],[65382,12530],[65383,12449],[65384,12451],[65385,12453],[65386,12455],[65387,12457],[65388,12515],[65389,12517],[65390,12519],[65391,12483],[65392,12540],[65393,12450],[65394,12452],[65395,12454],[65396,12456],[65397,65398,"R",
-52939],[65399,12461],[65400,12463],[65401,12465],[65402,12467],[65403,12469],[65404,12471],[65405,12473],[65406,12475],[65407,12477],[65408,12479],[65409,12481],[65410,12484],[65411,12486],[65412,12488],[65413,65418,"R",-52923],[65419,12498],[65420,12501],[65421,12504],[65422,12507],[65423,65427,"R",-52913],[65428,12516],[65429,12518],[65430,65435,"R",-52910],[65436,12527],[65437,12531],[65438,65439,"R",0],[65440,12644],[65441,65470,"R",-52848],[65474,65479,"R",-52851],[65482,65487,"R",-52853],[65490,
65495,"R",-52855],[65498,65500,"R",-52857],[65504,65505,"R",-65342],[65506,172],[65507,175],[65508,166],[65509,165],[65510,8361],[65512,9474],[65513,65516,"R",-56921],[65517,9632],[65518,9675],[66560,66599,"R",40],[69786,69788,"R",-1],[69803,69797],[69934,69935,"R",0],[119134,119135,"R",-7],[119136,119140,"A",119135],[119227,119230,"R",-2],[119231,119232,"R",-4],[119808,119833,"R",-119743],[119834,119859,"R",-119737],[119860,119885,"R",-119795],[119886,119911,"R",-119789],[119912,119937,"R",-119847],
[119938,119963,"R",-119841],[119964,119989,"R",-119899],[119990,120015,"R",-119893],[120016,120041,"R",-119951],[120042,120067,"R",-119945],[120068,120092,"R",-120003],[120094,120119,"R",-119997],[120120,120144,"R",-120055],[120146,120171,"R",-120049],[120172,120197,"R",-120107],[120198,120223,"R",-120101],[120224,120249,"R",-120159],[120250,120275,"R",-120153],[120276,120301,"R",-120211],[120302,120327,"R",-120205],[120328,120353,"R",-120263],[120354,120379,"R",-120257],[120380,120405,"R",-120315],
[120406,120431,"R",-120309],[120432,120457,"R",-120367],[120458,120483,"R",-120361],[120484,305],[120485,567],[120488,120504,"R",-119575],[120505,1012],[120506,120512,"R",-119575],[120513,8711],[120514,120538,"R",-119569],[120539,8706],[120540,1013],[120541,977],[120542,1008],[120543,981],[120544,1009],[120545,982],[120546,120562,"R",-119633],[120563,1012],[120564,120570,"R",-119633],[120571,8711],[120572,120596,"R",-119627],[120597,8706],[120598,1013],[120599,977],[120600,1008],[120601,981],[120602,
1009],[120603,982],[120604,120620,"R",-119691],[120621,1012],[120622,120628,"R",-119691],[120629,8711],[120630,120654,"R",-119685],[120655,8706],[120656,1013],[120657,977],[120658,1008],[120659,981],[120660,1009],[120661,982],[120662,120678,"R",-119749],[120679,1012],[120680,120686,"R",-119749],[120687,8711],[120688,120712,"R",-119743],[120713,8706],[120714,1013],[120715,977],[120716,1008],[120717,981],[120718,1009],[120719,982],[120720,120736,"R",-119807],[120737,1012],[120738,120744,"R",-119807],
[120745,8711],[120746,120770,"R",-119801],[120771,8706],[120772,1013],[120773,977],[120774,1008],[120775,981],[120776,1009],[120777,982],[120778,120779,"R",-119790],[120782,120791,"R",-120734],[120792,120801,"R",-120744],[120802,120811,"R",-120754],[120812,120821,"R",-120764],[120822,120831,"R",-120774],[126464,126465,"R",-124889],[126466,1580],[126467,1583],[126469,1608],[126470,1586],[126471,1581],[126472,1591],[126473,1610],[126474,126477,"R",-124871],[126478,1587],[126479,1593],[126480,1601],
[126481,1589],[126482,1602],[126483,1585],[126484,1588],[126485,126486,"R",-124907],[126487,1582],[126488,1584],[126489,1590],[126490,1592],[126491,1594],[126492,1646],[126493,1722],[126494,1697],[126495,1647],[126497,1576],[126498,1580],[126500,1607],[126503,1581],[126505,1610],[126506,126509,"R",-124903],[126510,1587],[126511,1593],[126512,1601],[126513,1589],[126514,1602],[126516,1588],[126517,126518,"R",-124939],[126519,1582],[126521,1590],[126523,1594],[126530,1580],[126535,1581],[126537,1610],
[126539,126541,"R",-124935],[126542,1587],[126543,1593],[126545,1589],[126546,1602],[126548,1588],[126551,1582],[126553,1590],[126555,1594],[126557,1722],[126559,1647],[126561,1576],[126562,1580],[126564,1607],[126567,1581],[126568,1591],[126569,1610],[126570,126573,"R",-124967],[126574,1587],[126575,1593],[126576,1601],[126577,1589],[126578,1602],[126580,1588],[126581,126582,"R",-125003],[126583,1582],[126585,1590],[126586,1592],[126587,1594],[126588,1646],[126590,1697],[126592,126593,"R",-125017],
[126594,1580],[126595,1583],[126596,126597,"R",-124989],[126598,1586],[126599,1581],[126600,1591],[126601,1610],[126603,126605,"R",-124999],[126606,1587],[126607,1593],[126608,1601],[126609,1589],[126610,1602],[126611,1585],[126612,1588],[126613,126614,"R",-125035],[126615,1582],[126616,1584],[126617,1590],[126618,1592],[126619,1594],[126625,1576],[126626,1580],[126627,1583],[126629,1608],[126630,1586],[126631,1581],[126632,1591],[126633,1610],[126635,126637,"R",-125031],[126638,1587],[126639,1593],
[126640,1601],[126641,1589],[126642,1602],[126643,1585],[126644,1588],[126645,126646,"R",-125067],[126647,1582],[126648,1584],[126649,1590],[126650,1592],[126651,1594],[127232,[48,46]],[127233,[48,44]],[127234,[49,44]],[127235,[50,44]],[127236,[51,44]],[127237,[52,44]],[127238,[53,44]],[127239,[54,44]],[127240,[55,44]],[127241,[56,44]],[127242,[57,44]],[127248,[40,65,41]],[127249,[40,66,41]],[127250,[40,67,41]],[127251,[40,68,41]],[127252,[40,69,41]],[127253,[40,70,41]],[127254,[40,71,41]],[127255,
[40,72,41]],[127256,[40,73,41]],[127257,[40,74,41]],[127258,[40,75,41]],[127259,[40,76,41]],[127260,[40,77,41]],[127261,[40,78,41]],[127262,[40,79,41]],[127263,[40,80,41]],[127264,[40,81,41]],[127265,[40,82,41]],[127266,[40,83,41]],[127267,[40,84,41]],[127268,[40,85,41]],[127269,[40,86,41]],[127270,[40,87,41]],[127271,[40,88,41]],[127272,[40,89,41]],[127273,[40,90,41]],[127274,[12308,83,12309]],[127275,67],[127276,82],[127277,[67,68]],[127278,[87,90]],[127280,127305,"R",-127215],[127306,[72,86]],
[127307,[77,86]],[127308,[83,68]],[127309,[83,83]],[127310,[80,80,86]],[127311,[87,67]],[127338,[77,67]],[127339,[77,68]],[127376,[68,74]],[127488,[12411,12363]],[127489,[12467,12467]],[127490,12469],[127504,127506,"R",0],[127507,12487],[127508,127528,"R",0],[127529,19968],[127530,127546,"R",0],[127552,[12308,12309]],[127553,[12308,12309]],[127554,[12308,12309]],[127555,[12308,12309]],[127556,[12308,12309]],[127557,[12308,12309]],[127558,[12308,12309]],[127559,[12308,12309]],[127560,[12308,12309]],
[127568,195101,"R",0]];net=net||{};net.kornr=net.kornr||{};net.kornr.unicode=net.kornr.unicode||{};
(function(a){function b(a){var b=0;return function(c){for(var f=b,g,k=0;0<=f&&f<a.length;){g=a[f];if(g instanceof Array)if(c<g[0])g=-1;else if(c>g[1])g=1;else return b=f,!0;else{if(g==c)return b=f,!0;g=c<g?-1:1}if(0==k)k=g;else if(k!=g)break;f+=g;if(f>a.length||0>f)break}return!1}}function c(a,c){if(void 0===a)return function(){throw"Missing data, you need to include "+c;};var d=b(a);return function(a){switch(typeof a){case "number":return d(a);case "string":for(var b=0,c=a.length;b<c;++b)if(!1===
d(a.charCodeAt(b)))return!1;return!0}return!1}}function f(a,b){function c(b,d){if(0>d)return-2;if(d>=a.length)return-1;var f=a[d];if(!f)return!1;if(2==f.length){if(f[0]==b)return f[1]}else if(f[0]<=b&&f[1]>=b)return"R"==f[2]?b+f[3]:f[3];return f[0]>b?-1:-2}if(void 0===a)return function(){throw"Missing data, you need to include "+b;};var f=0;return function(a){for(var b="",e=0,h=a.length;e<h;++e){var m;a:{m=a.charCodeAt(e);var n=f,p=c(m,n);if(0>p){for(var r=p,u=-2==r?1:-1;p===r;)if(n+=u,p=c(m,n),!(0>
p)){f=n;m=p;break a}f=n}else m=p}if(m instanceof Array)for(n=0;n<m.length;++n)b+=String.fromCharCode(m[n]);else b+=String.fromCharCode(m)}return b}}a.lowercase_nomark=f(a.norm_lowercase_nomark_data,"normalizer_lowercase_nomark.js");a.lowercase=f(a.norm_lowercase_data,"normalizer_lowercase.js");a.uppercase_nomark=f(a.norm_uppercase_nomark_data,"normalizer_uppercase_nomark.js");a.uppercase=f(a.norm_uppercase_data,"normalizer_uppercase.js");a.is_letter=c(a.categ_letters_data,"categ_letters.js");a.is_letter_number=
c(a.categ_letters_numbers_data,"categ_letters_numbers.js");a.is_number=c(a.categ_numbers_data,"categ_numbers.js");a.is_punct=c(a.categ_punct_data,"categ_puncts.js");a.is_separator=c(a.categ_separators_data,"categ_separators.js");a.is_punct_separator=c(a.categ_puncts_separators_data,"categ_puncts_separators_controls.js");a.is_punct_separator_control=c(a.categ_puncts_separators_controls_data,"categ_puncts_separators.js");a.is_control=c(a.categ_controls_data,"categ_controls.js");a.is_math=c(a.categ_maths_data,
"categ_maths.js");a.is_currency=c(a.categ_currencies_data,"categ_currencies.js");return a})(net.kornr.unicode);
fullproof=function(a){a.english=a.english||{};a.english.metaphone_make=function(a){return function(c,f){a=a||32;c=c.toLowerCase();c=c.replace(/([^c])\1/g,"$1");var e=c;c=e.match(/^(kn|gn|pn|ae|wr)/)?e.substr(1,e.length-1):e;c=c.replace(/mb$/,"m");c=c.replace(/ck/g,"k");e=c.replace(/([^s]|^)(c)(h)/g,"$1x$3").trim();e=e.replace(/cia/g,"xia");e=e.replace(/c(i|e|y)/g,"s$1");c=e=e.replace(/c/g,"k");e=c.replace(/d(ge|gy|gi)/g,"j$1");c=e=e.replace(/d/g,"t");e=c.replace(/gh(^$|[^aeiou])/g,"h$1");c=e=e.replace(/g(n|ned)$/g,
"$1");e=c.replace(/([^g]|^)(g)(i|e|y)/g,"$1j$3");e=e.replace(/gg/g,"g");c=e=e.replace(/g/g,"k");c=c.replace(/([aeiou])h([^aeiou])/g,"$1$2");c=c.replace(/ph/g,"f");c=c.replace(/q/g,"k");c=c.replace(/s(h|io|ia)/g,"x$1");e=c.replace(/^x/,"s");c=e=e.replace(/x/g,"ks");e=c.replace(/t(ia|io)/g,"x$1");c=e=e.replace(/th/,"0");c=c.replace(/tch/g,"ch");c=c.replace(/v/g,"f");c=c.replace(/^wh/,"w");c=c.replace(/w([^aeiou]|$)/g,"$1");c=c.replace(/y([^aeiou]|$)/g,"$1");e=c=c.replace(/z/,"s");c=e.charAt(0)+e.substr(1,
e.length).replace(/[aeiou]/g,"");c.toUpperCase();c.length>=a&&(c=c.substring(0,a));c=c.toUpperCase();return f?f(c):c}};a.english.metaphone=a.english.metaphone_make(32);return a}(fullproof||{});
fullproof=function(a){a.english=a.english||{};a.english.porter_stemmer=function(){var a=[];a.ational="ate";a.tional="tion";a.enci="ence";a.anci="ance";a.izer="ize";a.bli="ble";a.alli="al";a.entli="ent";a.eli="e";a.ousli="ous";a.ization="ize";a.ation="ate";a.ator="ate";a.alism="al";a.iveness="ive";a.fulness="ful";a.ousness="ous";a.aliti="al";a.iviti="ive";a.biliti="ble";a.logi="log";var c=[];c.icate="ic";c.ative="";c.alize="al";c.iciti="ic";c.ical="ic";c.ful="";c.ness="";return function(f,e){f=f.toLowerCase();
var h,d,l,g=f;if(3>f.length)return e?e(f):f;var k,q;l=f.substr(0,1);"y"==l&&(g=l.toUpperCase()+g.substr(1));k=/^(.+?)(ss|i)es$/;d=/^(.+?)([^s])s$/;k.test(g)?g=g.replace(k,"$1$2"):d.test(g)&&(g=g.replace(d,"$1$2"));k=/^(.+?)eed$/;d=/^(.+?)(ed|ing)$/;k.test(g)?(d=k.exec(g),k=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,k.test(d[1])&&(k=/.$/,g=g.replace(k,""))):d.test(g)&&(d=d.exec(g),h=d[1],d=/^([^aeiou][^aeiouy]*)?[aeiouy]/,d.test(h)&&(g=h,d=/(at|bl|iz)$/,q=/([^aeiouylsz])\1$/,h=/^[^aeiou][^aeiouy]*[aeiouy][^aeiouwxy]$/,
d.test(g)?g+="e":q.test(g)?(k=/.$/,g=g.replace(k,"")):h.test(g)&&(g+="e")));k=/^(.+?)y$/;k.test(g)&&(d=k.exec(g),h=d[1],k=/^([^aeiou][^aeiouy]*)?[aeiouy]/,k.test(h)&&(g=h+"i"));k=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;k.test(g)&&(d=k.exec(g),h=d[1],d=d[2],k=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,k.test(h)&&(g=h+a[d]));k=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;k.test(g)&&
(d=k.exec(g),h=d[1],d=d[2],k=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,k.test(h)&&(g=h+c[d]));k=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;d=/^(.+?)(s|t)(ion)$/;k.test(g)?(d=k.exec(g),h=d[1],k=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,k.test(h)&&(g=h)):d.test(g)&&(d=d.exec(g),h=d[1]+d[2],d=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,d.test(h)&&
(g=h));k=/^(.+?)e$/;k.test(g)&&(d=k.exec(g),h=d[1],k=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,d=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*([aeiouy][aeiou]*)?$/,q=/^[^aeiou][^aeiouy]*[aeiouy][^aeiouwxy]$/,k.test(h)||d.test(h)&&!q.test(h))&&(g=h);k=/ll$/;d=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/;k.test(g)&&d.test(g)&&(k=/.$/,g=g.replace(k,""));"y"==l&&(g=l.toLowerCase()+g.substr(1));
return e?e(g):g}}();return a}(fullproof||{});
fullproof=function(a){a.english=a.english||{};var b={a:1,"a's":1,able:1,about:1,above:1,according:1,accordingly:1,across:1,actually:1,after:1,afterwards:1,again:1,against:1,"ain't":1,all:1,allow:1,allows:1,almost:1,alone:1,along:1,already:1,also:1,although:1,always:1,am:1,among:1,amongst:1,an:1,and:1,another:1,any:1,anybody:1,anyhow:1,anyone:1,anything:1,anyway:1,anyways:1,anywhere:1,apart:1,appear:1,appreciate:1,appropriate:1,are:1,"aren't":1,around:1,as:1,aside:1,ask:1,asking:1,associated:1,at:1,
available:1,away:1,awfully:1,b:1,be:1,became:1,because:1,become:1,becomes:1,becoming:1,been:1,before:1,beforehand:1,behind:1,being:1,believe:1,below:1,beside:1,besides:1,best:1,better:1,between:1,beyond:1,both:1,brief:1,but:1,by:1,c:1,"c'mon":1,"c's":1,came:1,can:1,"can't":1,cannot:1,cant:1,cause:1,causes:1,certain:1,certainly:1,changes:1,clearly:1,co:1,com:1,come:1,comes:1,concerning:1,consequently:1,consider:1,considering:1,contain:1,containing:1,contains:1,corresponding:1,could:1,"couldn't":1,
course:1,currently:1,d:1,definitely:1,described:1,despite:1,did:1,"didn't":1,different:1,"do":1,does:1,"doesn't":1,doing:1,"don't":1,done:1,down:1,downwards:1,during:1,e:1,each:1,edu:1,eg:1,eight:1,either:1,"else":1,elsewhere:1,enough:1,entirely:1,especially:1,et:1,etc:1,even:1,ever:1,every:1,everybody:1,everyone:1,everything:1,everywhere:1,ex:1,exactly:1,example:1,except:1,f:1,far:1,few:1,fifth:1,first:1,five:1,followed:1,following:1,follows:1,"for":1,former:1,formerly:1,forth:1,four:1,from:1,further:1,
furthermore:1,g:1,get:1,gets:1,getting:1,given:1,gives:1,go:1,goes:1,going:1,gone:1,got:1,gotten:1,greetings:1,h:1,had:1,"hadn't":1,happens:1,hardly:1,has:1,"hasn't":1,have:1,"haven't":1,having:1,he:1,"he's":1,hello:1,help:1,hence:1,her:1,here:1,"here's":1,hereafter:1,hereby:1,herein:1,hereupon:1,hers:1,herself:1,hi:1,him:1,himself:1,his:1,hither:1,hopefully:1,how:1,howbeit:1,however:1,i:1,"i'd":1,"i'll":1,"i'm":1,"i've":1,ie:1,"if":1,ignored:1,immediate:1,"in":1,inasmuch:1,inc:1,indeed:1,indicate:1,
indicated:1,indicates:1,inner:1,insofar:1,instead:1,into:1,inward:1,is:1,"isn't":1,it:1,"it'd":1,"it'll":1,"it's":1,its:1,itself:1,j:1,just:1,k:1,keep:1,keeps:1,kept:1,know:1,knows:1,known:1,l:1,last:1,lately:1,later:1,latter:1,latterly:1,least:1,less:1,lest:1,let:1,"let's":1,like:1,liked:1,likely:1,little:1,look:1,looking:1,looks:1,ltd:1,m:1,mainly:1,many:1,may:1,maybe:1,me:1,mean:1,meanwhile:1,merely:1,might:1,more:1,moreover:1,most:1,mostly:1,much:1,must:1,my:1,myself:1,n:1,name:1,namely:1,nd:1,
near:1,nearly:1,necessary:1,need:1,needs:1,neither:1,never:1,nevertheless:1,"new":1,next:1,nine:1,no:1,nobody:1,non:1,none:1,noone:1,nor:1,normally:1,not:1,nothing:1,novel:1,now:1,nowhere:1,o:1,obviously:1,of:1,off:1,often:1,oh:1,ok:1,okay:1,old:1,on:1,once:1,one:1,ones:1,only:1,onto:1,or:1,other:1,others:1,otherwise:1,ought:1,our:1,ours:1,ourselves:1,out:1,outside:1,over:1,overall:1,own:1,p:1,particular:1,particularly:1,per:1,perhaps:1,placed:1,please:1,plus:1,possible:1,presumably:1,probably:1,
provides:1,q:1,que:1,quite:1,qv:1,r:1,rather:1,rd:1,re:1,really:1,reasonably:1,regarding:1,regardless:1,regards:1,relatively:1,respectively:1,right:1,s:1,said:1,same:1,saw:1,say:1,saying:1,says:1,second:1,secondly:1,see:1,seeing:1,seem:1,seemed:1,seeming:1,seems:1,seen:1,self:1,selves:1,sensible:1,sent:1,serious:1,seriously:1,seven:1,several:1,shall:1,she:1,should:1,"shouldn't":1,since:1,six:1,so:1,some:1,somebody:1,somehow:1,someone:1,something:1,sometime:1,sometimes:1,somewhat:1,somewhere:1,soon:1,
sorry:1,specified:1,specify:1,specifying:1,still:1,sub:1,such:1,sup:1,sure:1,t:1,"t's":1,take:1,taken:1,tell:1,tends:1,th:1,than:1,thank:1,thanks:1,thanx:1,that:1,"that's":1,thats:1,the:1,their:1,theirs:1,them:1,themselves:1,then:1,thence:1,there:1,"there's":1,thereafter:1,thereby:1,therefore:1,therein:1,theres:1,thereupon:1,these:1,they:1,"they'd":1,"they'll":1,"they're":1,"they've":1,think:1,third:1,"this":1,thorough:1,thoroughly:1,those:1,though:1,three:1,through:1,throughout:1,thru:1,thus:1,to:1,
together:1,too:1,took:1,toward:1,towards:1,tried:1,tries:1,truly:1,"try":1,trying:1,twice:1,two:1,u:1,un:1,under:1,unfortunately:1,unless:1,unlikely:1,until:1,unto:1,up:1,upon:1,us:1,use:1,used:1,useful:1,uses:1,using:1,usually:1,uucp:1,v:1,value:1,various:1,very:1,via:1,viz:1,vs:1,w:1,want:1,wants:1,was:1,"wasn't":1,way:1,we:1,"we'd":1,"we'll":1,"we're":1,"we've":1,welcome:1,well:1,went:1,were:1,"weren't":1,what:1,"what's":1,whatever:1,when:1,whence:1,whenever:1,where:1,"where's":1,whereafter:1,
whereas:1,whereby:1,wherein:1,whereupon:1,wherever:1,whether:1,which:1,"while":1,whither:1,who:1,"who's":1,whoever:1,whole:1,whom:1,whose:1,why:1,will:1,willing:1,wish:1,"with":1,within:1,without:1,"won't":1,wonder:1,would:1,"wouldn't":1,x:1,y:1,yes:1,yet:1,you:1,"you'd":1,"you'll":1,"you're":1,"you've":1,your:1,yours:1,yourself:1,yourselves:1,z:1,zero:1};a.english.stopword_remover=function(c,f){return a.normalizer.filter_in_object(c,b,f)};return a}(fullproof||{});
fullproof=function(a){a.french=a.french||{};a.french.simpleform=function(){function b(a){for(var b=[],c=0;c<a.length;++c){var e=a[c];if(e)switch(e.length){case 2:b.push([new RegExp("(.*)("+e[0].source+")(.*)"),e[1]]);break;case 3:b.push([new RegExp((e[0]?"(.*"+e[0].source+")":"(.*)")+"("+e[1].source+")(.*)"),e[2]]);break;case 4:b.push([new RegExp((e[0]?"(.*"+e[0].source+")":"(.*)")+"("+e[1].source+")"+(e[2]?"("+e[2].source+".*)":"(.*)")),e[3]])}}return b}function c(a,b,c){for(var e=0;e<b.length;++e){var f=
b[e][0].exec(a);f&&(a=f[1]+b[e][1]+f[f.length-1],c&&(e=b.length))}return a}var f=b([[/.../,/er(ai([st]?|ent)|i?(on[ts]|ez))$/,"e"],[/.../,/ass(i?(ez?|ons)|e(nt|s)?)$/,"e"],[/.../,/assions$/,"e"],[/.../,/assent$/,"e"],[/endr(ez?|ai[st]?|on[st])$/,"\u00e3"],[/.../,/iss(i?(ons|ez)|ai[st]?|ant(es?)?|es?)$/,""],[/irai(s|(en)?t)?$/,""],[/.../,/e?oi(re?|t|s|ent)$/,""],[/.../,/aient$/,""],[/.../,/a[mt]es$/,""],[/i?ons$/,""],[/ait$/,""],[/ent$/,""],[/i?e[rz]$/,"e"]]),e=b([[/inages?$/,"1"],[/.../,/ages?$/,
""],[/.../,/[aoie]tions?$/,""],[/og(ies?|ues?)$/,"og"],[/t(rices?|euses?)$/,"ter"],[/.../,/e(uses?|ries?|urs?)$/,"er"],[/utions$/,"u"],[/[ae]n[cs]es?$/,"\u00e3S"],[/..al/,/ites?$/,""],[/[ea]mment/,"\u00e3"],[/ives?$/,"if"],[/istes?$/,"isme"],[/ables?$/,""],[/[^ae]/,/ines?$/,"1"]]),h=b([[/n/,/t/,/iel/,"S"],[!1,/t/,/i[oea]/,"S"],[!1,/ain/,/[^aeiouymn].*|$/,"1"],[/ai(s$)?/,"e"],[!1,/am/,/[^aeiouymn].*|$/,"\u00e3"],[/aux?$/,"al"],[/e?au(x$)?/,"o"],[/an(te?s?|s)$/,"\u00e3"],[!1,/an/,/[^aeiouymn].*|$/,
"\u00e3"],[/r[dt]s?$/,"r"],[!1,/ein/,/[^aeiouymn].*|$/,"1"],[/e[ui]/,"e"],[/en[td]$/,"\u00e3"],[/i/,/en/,/[^aeiouymn].*|$/,"1"],[!1,/en/,/[^aeiouymn].*|$/,"\u00e3"],[/ets?$/,"e"],[!1,/e/,/o/,""],[/ier(s|es?)?$/,""],[!1,/i[nm]/,/[^aeiouymn].*|$/,"1"],[/ill/,"y"],[!1,/on/,/[^aeiouyhnm].*|$/,"\u00f4"],[!1,/ouin/,/[^aeiouymn].*|$/,"o1"],[/oe(u(d$)?)?/,"e"],[!1,/un/,/[^aeiouymn].*|$/,"1"],[/u[st]$/,"u"],[/yer$/,"i"],[/[^aeiouy]/,/ym/,/[^aeiouy].*|$/,"1"],[/[^aeiouy]/,/yn/,/[^aeiouynm].*|$/,"1"],[/[^aeiouy]/,
/y/,"i"],[/[aeiouy]/,/s/,/[aeiouy]/,"z"],[/sc?h/,"ch"],[/gu/,"g"],[!1,/g/,/[^aorl].*/,"j"],[/ph/,"f"],[/[^t]/,/t/,/ion/,"ss"],[/qu?/,"k"],[!1,/c/,/[auorlt]/,"k"],[/[aeiou]/,/s/,/[aeiou]/,"z"],[/[^c]/,/h/,""],[/^h/,""],[/[oiua]/,/t$/,!1,""],[/es?$/,""],[/[xs]$/,""]]);return function(b,l,g,k){g=void 0===g?!0:g;k=void 0===k?!0:k;(void 0===l||l)&&(b=c(b,f,!0));g&&(b=c(b,e,!0));k&&(b=c(b,h,!1));return a.normalizer.remove_duplicate_letters(b.toLowerCase())}}();return a}(fullproof||{});
fullproof=function(a){a.french=a.french||{};var b={a:1,"\u00e0":1,"\u00e2":1,abord:1,afin:1,ah:1,ai:1,aie:1,ainsi:1,allaient:1,allo:1,"all\u00f4":1,allons:1,"apr\u00e8s":1,apres:1,assez:1,attendu:1,au:1,aucun:1,aucune:1,aujourd:1,"aujourd'hui":1,auquel:1,aura:1,auront:1,aussi:1,autre:1,autres:1,aux:1,auxquelles:1,auxquels:1,avaient:1,avais:1,avait:1,avant:1,avec:1,avoir:1,ayant:1,b:1,bah:1,beaucoup:1,bien:1,bigre:1,boum:1,bravo:1,brrr:1,c:1,"\u00e7a":1,ca:1,car:1,ce:1,ceci:1,cela:1,celle:1,"celle-ci":1,
"celle-l\u00e0":1,"celle-la":1,celles:1,"celles-ci":1,"celles-l\u00e0":1,"celles-la":1,celui:1,"celui-ci":1,"celui-l\u00e0":1,"celui-la":1,cent:1,cependant:1,certain:1,certaine:1,certaines:1,certains:1,certes:1,ces:1,cet:1,cette:1,ceux:1,"ceux-ci":1,"ceux-l\u00e0":1,"ceux-la":1,chacun:1,chaque:1,cher:1,"ch\u00e8re":1,"ch\u00e8res":1,chere:1,cheres:1,chers:1,chez:1,chiche:1,chut:1,ci:1,cinq:1,cinquantaine:1,cinquante:1,"cinquanti\u00e8me":1,cinquieme:1,cinquantieme:1,"cinqui\u00e8me":1,clac:1,clic:1,
combien:1,comme:1,comment:1,compris:1,concernant:1,contre:1,couic:1,crac:1,d:1,da:1,dans:1,de:1,debout:1,dedans:1,dehors:1,"del\u00e0":1,dela:1,depuis:1,"derri\u00e8re":1,derriere:1,des:1,"d\u00e8s":1,"d\u00e9sormais":1,desormais:1,desquelles:1,desquels:1,dessous:1,dessus:1,deux:1,"deuxi\u00e8me":1,"deuxi\u00e8mement":1,deuxieme:1,deuxiemement:1,devant:1,devers:1,devra:1,"diff\u00e9rent":1,"diff\u00e9rente":1,"diff\u00e9rentes":1,"diff\u00e9rents":1,different:1,differente:1,differentes:1,differents:1,
dire:1,divers:1,diverse:1,diverses:1,dix:1,"dix-huit":1,"dixi\u00e8me":1,dixieme:1,"dix-neuf":1,"dix-sept":1,doit:1,doivent:1,donc:1,dont:1,douze:1,"douzi\u00e8me":1,douzieme:1,dring:1,du:1,duquel:1,durant:1,e:1,effet:1,eh:1,elle:1,"elle-m\u00eame":1,"elle-meme":1,elles:1,"elles-m\u00eames":1,"elles-memes":1,en:1,encore:1,entre:1,envers:1,environ:1,es:1,"\u00e8s":1,est:1,et:1,etant:1,"\u00e9taient":1,"\u00e9tais":1,"\u00e9tait":1,"\u00e9tant":1,etaient:1,etais:1,etait:1,etc:1,"\u00e9t\u00e9":1,ete:1,
etre:1,"\u00eatre":1,eu:1,euh:1,eux:1,"eux-m\u00eames":1,"eux-memes":1,"except\u00e9":1,excepte:1,f:1,"fa\u00e7on":1,facon:1,fais:1,faisaient:1,faisant:1,fait:1,feront:1,fi:1,flac:1,floc:1,font:1,g:1,gens:1,h:1,ha:1,"h\u00e9":1,he:1,hein:1,"h\u00e9las":1,helas:1,hem:1,hep:1,hi:1,ho:1,"hol\u00e0":1,hola:1,hop:1,hormis:1,hors:1,hou:1,houp:1,hue:1,hui:1,huit:1,"huiti\u00e8me":1,huitieme:1,hum:1,hurrah:1,i:1,il:1,ils:1,importe:1,j:1,je:1,jusqu:1,jusque:1,k:1,l:1,la:1,"l\u00e0":1,la:1,laquelle:1,las:1,
le:1,lequel:1,les:1,"l\u00e8s":1,lesquelles:1,lesquels:1,leur:1,leurs:1,longtemps:1,lorsque:1,lui:1,"lui-m\u00eame":1,"lui-meme":1,m:1,ma:1,maint:1,mais:1,"malgr\u00e9":1,malgre:1,me:1,"m\u00eame":1,"m\u00eames":1,meme:1,memes:1,merci:1,mes:1,mien:1,mienne:1,miennes:1,miens:1,mille:1,mince:1,moi:1,"moi-m\u00eame":1,"moi-meme":1,moins:1,mon:1,moyennant:1,n:1,na:1,ne:1,"n\u00e9anmoins":1,neanmoins:1,neuf:1,"neuvi\u00e8me":1,neuvieme:1,ni:1,nombreuses:1,nombreux:1,non:1,nos:1,notre:1,"n\u00f4tre":1,
"n\u00f4tres":1,notres:1,nous:1,"nous-m\u00eames":1,"nous-memes":1,nul:1,o:1,"o|":1,"\u00f4":1,oh:1,"oh\u00e9":1,"ol\u00e9":1,"oll\u00e9":1,ohe:1,ole:1,olle:1,on:1,ont:1,onze:1,"onzi\u00e8me":1,onzieme:1,ore:1,ou:1,"o\u00f9":1,ouf:1,ouias:1,oust:1,ouste:1,outre:1,p:1,paf:1,pan:1,par:1,parmi:1,partant:1,particulier:1,"particuli\u00e8re":1,"particuli\u00e8rement":1,particuliere:1,particulierement:1,pas:1,"pass\u00e9":1,passe:1,pendant:1,personne:1,peu:1,peut:1,peuvent:1,peux:1,pff:1,pfft:1,pfut:1,pif:1,
plein:1,plouf:1,plus:1,plusieurs:1,"plut\u00f4t":1,plutot:1,pouah:1,pour:1,pourquoi:1,premier:1,"premi\u00e8re":1,"premi\u00e8rement":1,"pr\u00e8s":1,premiere:1,premierement:1,pres:1,proche:1,psitt:1,puisque:1,q:1,qu:1,quand:1,quant:1,quanta:1,"quant-\u00e0-soi":1,"quant-a-soi":1,quarante:1,quatorze:1,quatre:1,"quatre-vingt":1,"quatri\u00e8me":1,"quatri\u00e8mement":1,quatrieme:1,quatriemement:1,que:1,quel:1,quelconque:1,quelle:1,quelles:1,quelque:1,quelques:1,"quelqu'un":1,quels:1,qui:1,quiconque:1,
quinze:1,quoi:1,quoique:1,r:1,revoici:1,"revoil\u00e0":1,revoila:1,rien:1,s:1,sa:1,sacrebleu:1,sans:1,sapristi:1,sauf:1,se:1,seize:1,selon:1,sept:1,"septi\u00e8me":1,septieme:1,sera:1,seront:1,ses:1,si:1,sien:1,sienne:1,siennes:1,siens:1,sinon:1,six:1,"sixi\u00e8me":1,sixieme:1,soi:1,"soi-m\u00eame":1,"soi-meme":1,soit:1,soixante:1,son:1,sont:1,sous:1,stop:1,suis:1,suivant:1,sur:1,surtout:1,t:1,ta:1,tac:1,tant:1,te:1,"t\u00e9":1,te:1,tel:1,telle:1,tellement:1,telles:1,tels:1,tenant:1,tes:1,tic:1,
tien:1,tienne:1,tiennes:1,tiens:1,toc:1,toi:1,"toi-m\u00eame":1,"toi-meme":1,ton:1,touchant:1,toujours:1,tous:1,tout:1,toute:1,toutes:1,treize:1,trente:1,"tr\u00e8s":1,tres:1,trois:1,"troisi\u00e8me":1,"troisi\u00e8mement":1,troisieme:1,troisiemement:1,trop:1,tsoin:1,tsouin:1,tu:1,u:1,un:1,une:1,unes:1,uns:1,v:1,va:1,vais:1,vas:1,"v\u00e9":1,ve:1,vers:1,via:1,vif:1,vifs:1,vingt:1,vivat:1,vive:1,vives:1,vlan:1,voici:1,"voil\u00e0":1,voila:1,vont:1,vos:1,votre:1,"v\u00f4tre":1,"v\u00f4tres":1,votre:1,
votres:1,vous:1,"vous-m\u00eames":1,"vous-memes":1,vu:1,w:1,x:1,y:1,z:1,zut:1};a.french.stopword_remover=function(c,f){return a.filter_in_object(c,b,f)};return a}(fullproof||{});

/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

"use strict";

var viewerSearchNameSpace = new AutodeskNamespace('Autodesk.Viewing.Extensions.InViewerSearch');

var actualString = "";
var index = 0;

var SearchEngine = function() {
    /**
     * number of attributes chunks
     * @type {number}
     */
    this.attributesMaxIndex = 10;
    this.dbNameAttr = "attrs";
    /**
     * fullproof search Engine
     * @type {null}
     */
    this.searchEngine = null;
    /**
     * this collection contains the attributes for the geometry/geometries. The attributes are stores in attributesMaxIndex chunks
     * @type Array
     */
    this.attributesCollection = [];
    this.geometry = {};

    this.geometryIdTableAux = {index: 0, values: {}};
    this.valuesTableAux = {index: 0, values: {}};
    this.nodeNamesTableAux = {index: 0, values: {}};
    this.fieldNameTableAux = {index: 0, values: {}};

    this.geometryIdTable = {};
    this.valuesTable = {};
    this.nodeNamesTable = {};
    this.fieldNameTable = {};
    this.valuesObjTable = {};

};

var proto = SearchEngine.prototype;

var onlyMem = [new fullproof.StoreDescriptor("memorystore", fullproof.store.MemoryStore)];

/**
 * returns the key for the object. If the value is not in, then will add it
 * and return the new key
 *
 * @param  {type} value value
 */
function getKeyByValue(obj, value) { //Object.prototype.getKeyByValue = function(value) {
    var key;

    if (obj.values.hasOwnProperty(value)) {
        return obj.values[value];
    }

    key = obj.index;
    obj.values[value] = key;
    obj.index = obj.index + 1;
    return key;
};

proto.compressAttribute = function(node, prop, geoId) {
    var attr = {
        geometryGuid: getKeyByValue(this.geometryIdTableAux, geoId),
        id: node.dbId,
        nodeName: getKeyByValue(this.nodeNamesTableAux, node.name),
        fieldNameId: getKeyByValue(this.fieldNameTableAux, prop.displayName),
        value: getKeyByValue(this.valuesTableAux, prop.displayValue),
    };

    this.nodeNamesTable[attr.nodeName] = node.name;
    this.geometryIdTable[attr.geometryGuid] = geoId;
    this.fieldNameTable[attr.fieldNameId] = prop.displayName;
    this.valuesTable[attr.value] = prop.displayValue;

    return attr;
}

proto.decompressAttribute = function(at) {
    var attr = {
        geometryGuid: this.geometryIdTable[at.geometryGuid],
        nodeName: this.nodeNamesTable[at.nodeName],
        id: at.id,
        name: this.fieldNameTable[at.fieldNameId],
        value: this.valuesTable[at.value],
    };
    return attr;
}
/**
 * gets the search values from fullproof result set
 * @param resultSet
 * @returns {Array}
 */
proto.getResultFromResultSet = function(resultSet) {
    var ids = [];
    var _this = this;

    if (resultSet) {
            var at = _this.decompressAttribute(resultSet.value);
            return at;
    }

    return null;
}

/**
 * Search the nodes that have property values that contain the substring/string text
 * @param index
 * @param text
 * @param callback after getting the results calls callback with results as a parameter.
 */
proto.stringSearch = function(index, text, cb) {
    var resultIds = [];
    var _this = this;
    var attributes = _this.attributesCollection[index];
    Object.keys(attributes).forEach(function(key) {
        var at = attributes[key];
        if (key.toLowerCase().indexOf(text) !== -1) {
            at.forEach(function(v) {
                resultIds.push(_this.decompressAttribute(v));
            });
        }
    });

    cb(index, resultIds);
};

/**
 * performs a search into the attributes, searching into the attributes chunks
 * @param text
 * @param cb -- callback
 */
proto.search = function(text, cb) {
    var _this = this;
    var length = _this.attributesCollection.length;

    var mergeResults = function(index, results) {
        var ended = (index === (length - 1)); // TODO(jwo): Why are reading .length at one point of time, and using it async later?
        cb(results, ended);
    }

    _this.attributesCollection.forEach(function(v, i) {
        _this.stringSearch(i, text, mergeResults);
    });

    if (!_this.attributesCollection.length) {
        setTimeout(function() { cb([], true); }, 0); return; // Explicitly move cb to async
    }

};

proto.deleteAuxTables = function () {
    delete this.geometryIdTableAux;
    delete this.valuesTableAux;
    delete this.fieldNameTableAux;
    delete this.nodeNamesTableAux;
};

proto.initialize = function(nodeProps, initialized, done, readyCallback) {
    var _this = this;
    if (!this.geometry.hasOwnProperty(nodeProps.geometry.guid)) {
        this.geometry[nodeProps.geometry.guid] = nodeProps.geometry;
    }
    if (!initialized) {
        _this.initializeFullproof(nodeProps.node, nodeProps.geometry, readyCallback);
    } else {
        _this.attrInjector(nodeProps.node, nodeProps.geometry, readyCallback);

    }

    if (done) {
        this.deleteAuxTables();
    }
    return;
};

function addValueToAttributesCollection(_this, attr, value) {
    if (!_this.attributesCollection[index]) {
        _this.attributesCollection[index] = {};
    }

    if (_this.attributesCollection[index].hasOwnProperty(value)) {
        _this.attributesCollection[index][value].push(attr);
    } else {
        _this.attributesCollection[index][value] = [attr];
    }

    if (index < _this.attributesMaxIndex - 1) {
        index++;
    } else {
        index = 0;
    }
}

function injectProperties(_this, injector, node, geometry) {
    var hasNameProp = false;
    var attr;
    var value;

    function afterInject() {
    }

    node.properties.forEach(function(prop) {
        if (!prop.hidden && prop.displayValue !== "") {
            if (prop.displayName && prop.displayName.toLowerCase() === "name") {
                hasNameProp = true;
            }
            attr = _this.compressAttribute(node, prop, geometry.guid);
            value = prop.displayValue;

            addValueToAttributesCollection(_this, attr, value);

            injector.inject(value, attr, afterInject);
        }

    });

    if (!hasNameProp && node.name) {
        attr = _this.compressAttribute(node, {displayName: "Name", displayValue: node.name}, geometry.guid);
        value = node.name;

        addValueToAttributesCollection(_this, attr, value);
        injector.inject(value, attr, afterInject);
    }
}

//node = {geometry, node}
proto.attrInjector = function(node, geometry, readyCallback) {
    var _this = this;

    _this.searchEngine.indexes.forEach(function(ind) {
        var injector = new fullproof.TextInjector(ind.index, ind.analyzer);
        injectProperties(_this, injector, node, geometry);
        readyCallback();
    });
};

/**
 * initialize the fullproof engine with the attributes passed as parameter. Also store the attributes
 * in the attributesCollection
 * @param attributes
 * @param dbName
 * @param geometry
 * @param readyCallback
 */
proto.initializeFullproof = function(node, geometry, readyCallback) {
    var _this = this;

    this.searchEngine = new fullproof.AdCadScoringEngine(onlyMem);

    var readSynchro = fullproof.make_synchro_point(function() {
        readyCallback();
    }, 1);

    function attrInitializer(injector, cb) {
        injectProperties(_this, injector, node, geometry);
        cb(true);
    }

    var attrIndex1 = {
        name: "stemmedindex1",
        analyzer: new fullproof.AdCadScoringAnalyzer(fullproof.normalizer.to_lowercase_nomark, fullproof.english.porter_stemmer),
        capabilities: new fullproof.Capabilities().setDbName(_this.dbNameAttr).setUseScores(true).setComparatorObject(fullproof.ScoredEntry.comparatorObject),
        initializer: attrInitializer,
    };

    this.searchEngine.open([attrIndex1], function() {
        readSynchro();
    }, function() {
        worker.postMessage({operation: "INIT_ERROR"});
    });

};

function processItemResult(str, item, geoGuid, isSharedPropertyDb, resultObj, geometries) {
    var name;
    var displayName;
    var itemValue;

    geoGuid = (geoGuid ? geoGuid : item.geometryGuid);

    if (!resultObj.searchedIds.hasOwnProperty(geoGuid)) {
        resultObj.searchedIds[geoGuid] = {};
    }

    if (!resultObj.searchedIds[geoGuid].hasOwnProperty(item.id)) {
        var newItem = {displayName: "", dbId: item.id, fieldName: item.name, fieldValue: item.value, nodeName: item.nodeName};
        resultObj.searchedIds[geoGuid][item.id] = item.id;
        var name = '';

        if (geometries.hasOwnProperty(geoGuid)) {
            name = geometries[geoGuid].name;
        }

        if (resultObj.totalResultsIndex.hasOwnProperty(geoGuid)) {
            resultObj.totalResults[resultObj.totalResultsIndex[geoGuid]].results.push(newItem);
        } else {
            resultObj.totalResults.push({id: geoGuid, name: name, results: [newItem]});
            resultObj.totalResultsIndex[geoGuid] = resultObj.totalResults.length - 1;
        }

        resultObj.resultsCount++;
    }
}

proto.setResults = function(str, results, ended, geo, isSharedPropertyDb, resultObj, geometries, cb) {
    var self = this;

    results.forEach(function(item) {
        if(item.hasOwnProperty("key")) {
            item = self.getResultFromResultSet(item);
        }
        processItemResult(str, item, geo, isSharedPropertyDb, resultObj, geometries);
    });
    if (ended) {
        cb(str, resultObj, ended); return;
    }

};

proto.processResults = function(str, results, ended, resultObj, isSharedPropertyDb, geometries, cb){
    var self = this;
    if (!geometries) {
        geometries = this.geometry;
    }
    if (isSharedPropertyDb) {
        var keys = Object.keys(geometries);
        var length = keys.length;
        keys.forEach(function(guid) {
            self.setResults(str, results, (ended && length === 1), guid, isSharedPropertyDb, resultObj, geometries, cb);
            length--;
        });
    } else {
        self.setResults(str, results, ended, null, false, resultObj, geometries, cb);
    }
};

/**
 * searches using fullproof and string search algorithms
 * @param str
 * @param cb - callback to process the results
 */
proto.doSearch = function(str, isSharedPropertyDb, geometries, cb) {
    var _this = this;
    var resultObj = {
        partialResults: [],
        totalResults: [],
        totalResultsIndex: {},
        resultsCount: 0,
        searchedIds: {},
    };

    if (str.length > 0) {
        _this.searchEngine.lookup(str, function(resultSet) {
            if (resultSet && resultSet.data.length) {
                _this.processResults(str, resultSet.data, false, resultObj, isSharedPropertyDb, geometries, cb);
            }
        });

        setTimeout(function() {
            _this.search(str, function(stringSearchResults, ended) {
                _this.processResults(str, stringSearchResults, ended, resultObj, isSharedPropertyDb, geometries, cb);
            });
        }, 0);
    }
};

/*
 * Copyright 2016 Autodesk, Inc. All Rights Reserved.
 *
 * This computer source code and related instructions and comments
 * are the unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under applicable copyright and trade secret law.
 * They may not be disclosed to, copied or used by any third party without the prior
 * written consent of Autodesk, Inc.
 */

var avp = Autodesk.Viewing.Private;

var IS_WORKER = (typeof self !== 'undefined') && (typeof window === 'undefined');
if (IS_WORKER) {

    /*
    if (!avp.IS_CONCAT_BUILD)  {
        //Everything below will get compiled into the worker JS during build
        importScripts("../../../src/AutodeskNamespace.js");

        importScripts("../../../src/lmvtk/common/InputStream.js");
        importScripts("../../../src/lmvtk/common/VbUtils.js");
        importScripts("../../../src/lmvtk/common/VertexBufferBuilder.js");
        importScripts("../../../src/lmvtk/common/Propdb.js");
        importScripts("../lib/fullproof/fullproof-all.js");
        importScripts("../worker/SearchEngine.js");
    }
    */

    var viewerProperties = null;
    var currentGeometry = null;
    var geometriesCache = {};
    var waitingCurrentGeo = {};
    var initialized = false;
    var searchFactory = null;
    var currentResults = null;

    var loadingProperties = 0; //this is set to two because one is thisView and the other is ThisItem
    var waitingGeometriesToSearch = {};
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    var replaceHtmlCh = function (str) {
         return String(str).replace(/[&<>"'\/]/g, function (s) {
             return entityMap[s];
         });
     };

     // FIXME(jwo): Should call the sanitizeAndHighlightString() of the Search SDK instead
     var highlightText = function (text, highlightStr) {
         var pattern = new RegExp('(' + highlightStr + ')', 'i'),
             replaceWith = '<span class="bolder">$1</span>',
             highlighted = replaceHtmlCh(text.toString()).replace(pattern, replaceWith);

         return highlighted;
     };

    var worker = self;
    /**
     * viewer property service encapsulates the logic to get the geometries properties
     * @constructor
     */
    var ViewerProperties = function () {
        this.isSharedPropertyDb = true;
        this.geometries = null;
        this.resultObj = {
            totalResults: [],
            totalResultsIndex: {},
            resultsCount: 0,
        };
    };

    var proto = ViewerProperties.prototype;

    /**
     * gets the property array from file and store it in storage object
     * @param resourceName
     * @param url
     * @param loadContext
     * @param storage
     * @returns {*}
     */
    function requestFile(resourceName, url, loadContext, storage, cb) {
        function onFailure(status, statusText, data) {

            // We're explicitly ignoring missing property files.
            cb(null); return;
        }

        //running local pointing to local file
        if (url.indexOf("$file$") >= 0) {
            url = loadContext.basePath.substr(0, loadContext.basePath.indexOf("output")) + url.substr(url.indexOf("output"), url.length);
        }

        var onSuccess = function(response) {

            storage[resourceName] = response;
            cb(response); return;
        };

        avp.ViewingService.getItem(loadContext, url, onSuccess, onFailure);
    }

    /**
     * Gets the property files and creates the PropertyDatabase
     * @param urn
     * @param geo
     */
    function getPropertyFiles(urn, geometry, loadContext, onPropertyPackLoadComplete) {
        var _this = this;
        var baseUrl;
        var propdbsettings = {
            ids: {},
            attrs: {},
            offsets: {},
            values: {},
            avs: {}
        };

        loadContext.url = loadContext.viewing_url + urn;
        baseUrl = loadContext.url;

        if (!urn) {
            onPropertyPackLoadComplete(geometry, propdbsettings);
            return;
        }

        var filesToRequest = [];
        filesToRequest.push({filename: "objects_attrs.json.gz", storage: propdbsettings.attrs});
        filesToRequest.push({filename: "objects_vals.json.gz", storage: propdbsettings.values});
        filesToRequest.push({filename: "objects_avs.json.gz", storage: propdbsettings.avs});
        filesToRequest.push({filename: "objects_offs.json.gz", storage: propdbsettings.offsets});
        filesToRequest.push({filename: "objects_ids.json.gz", storage: propdbsettings.ids});

        var triedUncompressed = false;
        function getUncompressedFiles() {
            var uncompressedFilesToRequest = [];

            uncompressedFilesToRequest.push({filename: "objects_attrs.json", storage: propdbsettings.attrs});
            uncompressedFilesToRequest.push({filename: "objects_vals.json", storage: propdbsettings.values});
            uncompressedFilesToRequest.push({filename: "objects_avs.json", storage: propdbsettings.avs});
            uncompressedFilesToRequest.push({filename: "objects_offs.json", storage: propdbsettings.offsets});
            uncompressedFilesToRequest.push({filename: "objects_ids.json", storage: propdbsettings.ids});
            return uncompressedFilesToRequest;
        }

        var filesRemaining = filesToRequest.length;
        var filesFailed = 0;

        /**
         * onComplete - After getting the property files (propdbsettings),
         * we create the PropertyDatabase
         * @param  {type} data description
         */
        function onComplete(data) {
            filesRemaining--;
            if (!data)
                filesFailed++;

            if (!filesRemaining) {
                if (filesFailed) {
                    if (triedUncompressed) {
                        onPropertyPackLoadComplete(geometry, {});
                        return;
                    } else {
                        //Give it another go with uncompressed file names
                        //This will only be the case for very old legacy LMV data.
                        triedUncompressed = true;
                        filesToRequest = getUncompressedFiles();
                        filesRemaining = filesToRequest.length;
                        filesFailed = 0;

                        filesToRequest.forEach(function(f) {
                            requestFile(f.filename, baseUrl + f.filename, loadContext, f.storage, onComplete);
                        });
                    }
                } else {
                    onPropertyPackLoadComplete(geometry, propdbsettings);
                    return;
                }
            }
        }

        filesToRequest.forEach(function(f) {
            requestFile(f.filename, baseUrl + f.filename, loadContext, f.storage, onComplete);
        });
    };

    function createDB(geometry, propdbsettings, propDBCreated){
        var geo = geometry.guid;
        var lmv = Autodesk.LMVTK;
        var propDB = new lmv.PropertyDatabase(propdbsettings);
        geometriesCache[geo] = {
            geometry: geometry,
            propDB: propDB
        };

        try {
            geometriesCache[geo].objCount = propDB.getObjectCount();
        } catch (e) {
            //case no properties
            geometriesCache[geo].objCount = 0;
        }
        propDBCreated(geo, geometriesCache[geo].objCount);
    }
    /**
     * Gets the property files and creates the PropertyDatabase
     *
     * @returns {geometryId, propDB}
     */
    proto.loadProperties = function(geoPropertyPacks, context, propDBCreated) {
        var onPropertyDbLoaded = function (geometry, propdbsettings) {
            loadingProperties--;
            createDB(geometry, propdbsettings, propDBCreated);
        }

        if (geoPropertyPacks) {
            geoPropertyPacks.forEach(function(g) {
                loadingProperties++;
                getPropertyFiles(g.urn, g.geo, context, onPropertyDbLoaded);
            });
        }
    };

    function noMoreDbs() {
        for (var guid in geometriesCache) {
            if (geometriesCache[guid].propDB) {
                return false;
            }
        }
        return true;
    }

    /**
     * gets the properties for the given geometry. This calls to PropertyDatabase getObjectProperties method.
     * The attributes are returned as a Map where the key is the value of the property and the values are
     * collections of nodes that contains that property value.
     * @param guid
     */
    proto.getGeometryAttributes = function(guid, sharedPropDbKey, isSharedPropertyDb, callback) {
        var key = isSharedPropertyDb ? sharedPropDbKey : guid;
        var length;
        var id;
        var node;
        var ended;
        var geometry;
        if (geometriesCache.hasOwnProperty(key) && geometriesCache[key].propDB) {
            geometry = {guid: geometriesCache[key].geometry.guid, name: geometriesCache[key].geometry.name};
            var propdb = geometriesCache[key].propDB;

            try {
                length = propdb.getObjectCount() + 1;
                for (id = 0; id < length; id++) {
                    node = propdb.getObjectProperties(id, null, true, []);
                    ended = id === (length - 1);
                    if (ended) {
                        //we are not going to use the propDB anymore
                        geometriesCache[key].propDB = null;
                    }

                    if (node && node.properties.length) {
                        callback({geometry: geometry, node: node}, ended);
                    } else if (ended) {
                        //if it is the last one I send it to know that is finished
                        callback({geometry: geometry, node: node || {}}, ended);
                    }


                }
            } catch(e) {
                // getProperties failed if there are no nodes
                geometriesCache[key].propDB = null;
                callback({geometry: geometry, node: {}}, true);
            }
        } else {
            // TODO(go) 20160520 - investigate this, some guids are not in the cache, should we do something else?
            if (geometriesCache[key]) {
                callback({geometry: {guid: geometriesCache[key].geometry.guid, name: geometriesCache[key].geometry.name}, node: {}}, true);
            } else {
                callback({geometry: {}, node: {}}, true);
            }
        }

    };

    /**
     * for each geometry, it gets the geometries attributes
     * @returns {Array}
     */
    proto.getGeometriesAttributes = function(sharedPropDbKey, isSharedPropertyDb, callback){
        var geoAttr = [];
        var attributes = [];
        var self = this;
        var nextGeo = null;

        function onSuccess(attr, ended) {
            //attributes.push(attr);
            callback(attr, (ended && !geoAttr.length));

            if (ended && geoAttr.length > 0) {
                nextGeo = geoAttr.shift();
                self.getGeometryAttributes(nextGeo, sharedPropDbKey, isSharedPropertyDb, onSuccess);
            }
        }

        if (!isSharedPropertyDb) {
            //not shared property so we get the properties for the related items
            for (var guid in geometriesCache) {
                if (guid !== currentGeometry) {
                    geoAttr.push(guid);
                }
            }
            nextGeo = geoAttr.shift();
            if (nextGeo) {
                self.getGeometryAttributes(nextGeo, sharedPropDbKey, isSharedPropertyDb, onSuccess);
            } else {
                //if no related items and no properties for current then there are no properties
                callback({}, isSharedPropertyDb, true);
            }
        }
    };

    proto.initializeSearchEngine = function(node, ended, cb) {
        if (!initialized) {
            searchFactory = new SearchEngine();
        }

        var done = noMoreDbs() && (loadingProperties === 0);
        searchFactory.initialize(node, initialized, done, function() {
            if (ended) {
                cb();
            }

        });
        initialized = true;
    };

    /**
     * searches which property value contains the str passed as a parameter. This calls PropertyDatabase bruteForceSearch
     * method
     * @param str
     * @param guid - geometry id
     * @returns {*}
     */
    function bruteSearchForGeo(str, guid, callback){
        if (geometriesCache.hasOwnProperty(guid) && geometriesCache[guid].propDB) {
            var propdb = geometriesCache[guid].propDB;
            try {
                var res = propdb.bruteForceSearch(str, [], true);
                callback({geometry: guid, results: res});
            } catch(e) {
                //qsApi.logErrorEvent("Error getting search results for geometry: " + guid, "viewerProperties.srv", "bruteSearchForGeo");
                callback({geometry: guid, results: []});
            }
        }
        else {
            callback({geometry: guid, results: []});
        }
    }

    /**
     * searches in all geometries
     * @param str
     * @returns {Array}
     */
    proto.bruteSearch = function(str, currentGeo, geometries, callback){
        var geometriesToSearch = [];
        var geoResults = [];
        var nextGeo = null;
        var _this =  this;
        currentGeometry = currentGeo;
        this.resultObj = {
            partialResults: [],
            totalResults: [],
            totalResultsIndex: {},
            resultsCount: 0,
        };
        var returnResults = false;

        function onComplete(results) {
            waitingGeometriesToSearch[str] = geometriesToSearch.length > 0;
            _this.processBigModelResForGeometries(str, results, "", false, geometries, _this.resultObj, true, function(str, results, ended, geometry) {
                if (geometriesToSearch.length < 1 && waitingCurrentGeo[str]) {
                    callback(str, results, false, geometry);
                } else {
                    callback(str, results, geometriesToSearch.length < 1, geometry);
                }
            });

            if (geometriesToSearch.length > 0) {
                nextGeo = geometriesToSearch.shift();
                if (nextGeo === currentGeometry) {
                    if (currentResults) {
                        _this.resultObj.totalResults.push({id: nextGeo, name: currentResults.name, results: currentResults.results});
                        currentResults = null;
                        returnResults = true;
                    } else {
                        _this.resultObj.totalResults.push({id: nextGeo, name: geometriesCache[currentGeometry].geometry.name, results: []});
                    }

                    _this.resultObj.totalResultsIndex[nextGeo] = _this.resultObj.totalResults.length - 1;
                    if (returnResults) {
                        callback(str, _this.resultObj, geometriesToSearch.length < 1, nextGeo);
                        returnResults = false;
                    }

                    if (geometriesToSearch.length > 0) {
                        nextGeo = geometriesToSearch.shift();
                        bruteSearchForGeo(str, nextGeo, onComplete);
                    }

                } else {
                    bruteSearchForGeo(str, nextGeo, onComplete);
                }
            }
        }

        waitingCurrentGeo[str] = true;
        waitingGeometriesToSearch[str] = true;
        geometries.forEach(function(g) {
            geometriesToSearch.push(g.guid);
            if (g.guid === currentGeometry && !geometriesCache.hasOwnProperty(currentGeometry)) {
                geometriesCache[currentGeometry] = {geometry: geometry};
            }
        });

        nextGeo = geometriesToSearch.shift();
        bruteSearchForGeo(str, nextGeo, onComplete);
    };

    function handleItem(str, searchedIds, item, geoGuid, resultObj, geometry) {
        var itemValue;

        if (!(geoGuid in searchedIds)){
            searchedIds[geoGuid] = {};
        }

        if (!searchedIds[geoGuid].hasOwnProperty(item.id)) {
            var name = item.nodeName;

            if (name.indexOf(str) >= 0 || (item.hasOwnProperty("name") && item.name === "Name")) {
                displayName = highlightText(nodeName, str);
            } else {

                if (!name) {
                    name = "Untitled Node";
                }

                var displayName = replaceHtmlCh(name);
                if (item.hasOwnProperty("name") && item.hasOwnProperty("value")) {
                    itemValue = (Object.prototype.toString.call(item.value) === '[object Number]' ? String(item.value) : item.value);
                    displayName = displayName + " (" + item.name + ": " + highlightText(itemValue, str) + ")";
                }
            }

            var newItem = {displayName: displayName, dbId: item.id, fieldName: item.name, fieldValue: item.value, nodeName: item.nodeName};
            searchedIds[geoGuid][item.id] = item.id;

            name = '';

            if (geometry) {
                name = geometry.name;
            }

            if (resultObj.totalResultsIndex.hasOwnProperty(geoGuid)) {
                resultObj.totalResults[resultObj.totalResultsIndex[geoGuid]].results.push(newItem);
            } else {
                if (geoGuid === currentGeometry) {
                    if (!currentResults) {
                        currentResults = {id: geoGuid, name: name, results: []};
                    }
                    currentResults.results.push(newItem);
                } else {
                    resultObj.totalResults.push({id: geoGuid, name: name, results: [newItem]});
                    resultObj.totalResultsIndex[geoGuid] = resultObj.totalResults.length - 1;
                }
            }

            resultObj.resultsCount++;
        }
    }

    proto.processBigModelResForGeometries = function(str, searchResults, sharedPropDbKey, isSharedPropertyDb, geometries, resultObj, brutesearchCtx, callback) {
        var nodes = {};
        var searchedIds = {};
        var self = this;
        var geoGuid;
        var length;
        var geometryKeys;

        if (!resultObj) {
            resultObj = this.resultObj;
        }

        if (isSharedPropertyDb) {
            //duplicate results for each geometry
            length = geometries.length;
            geometries.forEach(function(geo) {
                searchedIds = {};
                if (geo.guid !== sharedPropDbKey) {
                    searchResults.results.forEach(function(item){
                        handleItem(str, searchedIds, item, geo.guid, resultObj, geo);
                    });
                    length--;
                    //if (length < 1) {
                        callback(str, resultObj, length < 1, geo.guid);
                    //}

                }
            });
        } else {
            if (!brutesearchCtx) {
                //if there is the currentGeo results
                waitingCurrentGeo[str] = false;
            }
            geoGuid = searchResults.geometry;
            searchResults.results.forEach(function(item){
                handleItem(str, searchedIds, item, geoGuid, resultObj, geometriesCache[geoGuid].geometry);
            });
            //callback(nodes, searchedIds, geoGuid);
            ended = !waitingCurrentGeo[str] && !waitingGeometriesToSearch[str];
            if (brutesearchCtx || !currentResults) {
                callback(str, resultObj, ended, geoGuid);
            }
        }
    };


//Web worker dispatcher function -- received a message
//from the main thread and calls the appropriate handler
    self.addEventListener('message', function(e) {

        var loadContext = e.data;
        loadContext.worker = self;
        if(!viewerProperties){
            viewerProperties = new ViewerProperties();
        }
        switch (loadContext.operation){
            case "SET_DEBUG":
                avp.logger.setLevel(loadContext.enable ? loadContext.level : avp.LogLevels.ERROR);
                break;
            case "CREATE_PROP_DB":
                viewerProperties.loadProperties(loadContext.geoPropertyPacks, loadContext.context, function(guid, objCount){
                    loadContext.worker.postMessage({operation: "PROP_DB_CREATED", guid: guid, objCount: objCount});
                });
                break;
            case "BRUTE_SEARCH":
                viewerProperties.bruteSearch(loadContext.str, loadContext.currentGeo, loadContext.geometries, function(str, result, ended, geometry){
                    loadContext.worker.postMessage({operation: "BRUTE_SEARCH_OK", str: str, result: result, ended: ended, geometry: geometry});
                });
                break;
            case "PROCESS_BRUTE_SEARCH":
                viewerProperties.processBigModelResForGeometries(loadContext.str, loadContext.results, loadContext.sharedPropDbKey, loadContext.isSharedPropertyDb, loadContext.geometries, null, false, function(str, result, ended, geometry) {
                    loadContext.worker.postMessage({operation: "BRUTE_SEARCH_OK", str: str, result: result, ended: ended, geometry: geometry});
                });
                break;
            case "GEOMETRIES_ATTR":
                viewerProperties.getGeometriesAttributes(loadContext.sharedPropDbKey, loadContext.isSharedPropertyDb, function(node, ended){
                    if (!node.node || !node.node.properties) {
                        //no properties found for this geometry
                        if (ended && noMoreDbs()) {
                            searchFactory.deleteAuxTables();
                        }
                        loadContext.worker.postMessage({operation: "GEOMETRIES_ATTR_ERR", geometry: node.geometry, ended: ended});
                    } else {
                        viewerProperties.initializeSearchEngine(node, ended, function () {
                            loadContext.worker.postMessage({operation: "GEOMETRIES_ATTR_OK"});
                        });
                    }

                });
                break;
            case "GEOMETRY_ATTR":
                currentGeometry = loadContext.guid;
                viewerProperties.getGeometryAttributes(loadContext.guid, loadContext.sharedPropDbKey, loadContext.isSharedPropertyDb, function(node, ended){
                    if (!node.node || !node.node.properties) {
                        //no properties found for this geometry
                        if (ended && noMoreDbs()) {
                            searchFactory.deleteAuxTables();
                        }
                        loadContext.worker.postMessage({operation: "GEOMETRY_ATTR_ERR"});
                    } else {
                        viewerProperties.initializeSearchEngine(node, ended, function () {
                            loadContext.worker.postMessage({operation: "GEOMETRY_ATTR_OK"});
                        });
                    }
                });
                break;
            case "SEARCH":
                actualString = loadContext.str;
                if (searchFactory) {
                    searchFactory.doSearch(loadContext.str, loadContext.isSharedPropertyDb, loadContext.geometries, function(str, stringSearchResults, ended) {
                        if (actualString === str) {
                            loadContext.worker.postMessage({operation: "SEARCH_RESULT", str: str, results: stringSearchResults, ended: ended});
                        } else {
                            loadContext.worker.postMessage({operation: "OLD_SEARCH_RESULT"});
                        }
                    });
                } else {
                    //no attributes
                    var resultObj = {
                        partialResults: [],
                        totalResults: [],
                        totalResultsIndex: {},
                        resultsCount: 0,
                        searchedIds: {},
                    };
                    loadContext.worker.postMessage({operation: "SEARCH_RESULT", str: loadContext.str, results: resultObj, ended: true});
                }
                break;
        }

    }, false);


    self.raiseError = function(code, msg, args) {
        self.postMessage({ "error": { "code": code, "msg": msg, "args": args }});
    };

} //IS_WORKER
