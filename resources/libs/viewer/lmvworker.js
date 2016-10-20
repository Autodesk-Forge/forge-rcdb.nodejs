
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

var rescueFromPolymer = av.rescueFromPolymer = (function() {

    if (av.isSafari()) {

        return function(object) {

            if (!window.Polymer)
                return object;

            for (var p in object) {
                if (p.indexOf("__impl") !== -1) {
                    return object[p];
                }
            }
            return object;
        };

    } else {

        return function(o) { return o; };

    }

})();

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

avp.IS_CONCAT_BUILD = true;

/** @define {string} */
avp.BUILD_LMV_WORKER_URL = "lmvworker.js";
avp.LMV_WORKER_URL = avp.BUILD_LMV_WORKER_URL;

avp.ENABLE_DEBUG = avp.ENABLE_DEBUG || false;
avp.ENABLE_TRACE = avp.ENABLE_TRACE || false;
avp.DEBUG_SHADERS = avp.DEBUG_SHADERS || false;
avp.ENABLE_INLINE_WORKER = true;

/**
 * @author mrdoob / http://mrdoob.com/
 * @author *kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 */
/* Pruned version of THREE.Vector3, for use in the LMV web worker */


LmvVector3 = function ( x, y, z ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;

};

LmvVector3.prototype = {

	constructor: LmvVector3,

	set: function ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	},

	setX: function ( x ) {

		this.x = x;

		return this;

	},

	setY: function ( y ) {

		this.y = y;

		return this;

	},

	setZ: function ( z ) {

		this.z = z;

		return this;

	},

	setComponent: function ( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			default: throw new Error( 'index is out of range: ' + index );

		}

	},

	getComponent: function ( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw new Error( 'index is out of range: ' + index );

		}

	},

	clone: function () {

		return new this.constructor( this.x, this.y, this.z );

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	},

	add: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
			return this.addVectors( v, w );

		}

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	},

	addScalar: function ( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	},

	addVectors: function ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	},

	addScaledVector: function ( v, s ) {

		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;

		return this;

	},

	sub: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
			return this.subVectors( v, w );

		}

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	},

	subScalar: function ( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	},

	subVectors: function ( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	},

	multiply: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.' );
			return this.multiplyVectors( v, w );

		}

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	},

	multiplyScalar: function ( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;

	},

	multiplyVectors: function ( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	},

	applyMatrix3: function ( m ) {

		var x = this.x;
		var y = this.y;
		var z = this.z;

		var e = m.elements;

		this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
		this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
		this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

		return this;

	},

	applyMatrix4: function ( m ) {

		// input: THREE.Matrix4 affine matrix

		var x = this.x, y = this.y, z = this.z;

		var e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z + e[ 12 ];
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z + e[ 13 ];
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ];

		return this;

	},

	applyProjection: function ( m ) {

		// input: THREE.Matrix4 projection matrix

		var x = this.x, y = this.y, z = this.z;

		var e = m.elements;
		var d = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] ); // perspective divide

		this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z + e[ 12 ] ) * d;
		this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z + e[ 13 ] ) * d;
		this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * d;

		return this;

	},

	applyQuaternion: function ( q ) {

		var x = this.x;
		var y = this.y;
		var z = this.z;

		var qx = q.x;
		var qy = q.y;
		var qz = q.z;
		var qw = q.w;

		// calculate quat * vector

		var ix =  qw * x + qy * z - qz * y;
		var iy =  qw * y + qz * x - qx * z;
		var iz =  qw * z + qx * y - qy * x;
		var iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return this;

	},

	transformDirection: function ( m ) {

		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction

		var x = this.x, y = this.y, z = this.z;

		var e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z;
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z;
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		this.normalize();

		return this;

	},

	divide: function ( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	},

	divideScalar: function ( scalar ) {

		if ( scalar !== 0 ) {

			var invScalar = 1 / scalar;

			this.x *= invScalar;
			this.y *= invScalar;
			this.z *= invScalar;

		} else {

			this.x = 0;
			this.y = 0;
			this.z = 0;

		}

		return this;

	},

	min: function ( v ) {

		if ( this.x > v.x ) {

			this.x = v.x;

		}

		if ( this.y > v.y ) {

			this.y = v.y;

		}

		if ( this.z > v.z ) {

			this.z = v.z;

		}

		return this;

	},

	max: function ( v ) {

		if ( this.x < v.x ) {

			this.x = v.x;

		}

		if ( this.y < v.y ) {

			this.y = v.y;

		}

		if ( this.z < v.z ) {

			this.z = v.z;

		}

		return this;

	},

	clamp: function ( min, max ) {

		// This function assumes min < max, if this assumption isn't true it will not operate correctly

		if ( this.x < min.x ) {

			this.x = min.x;

		} else if ( this.x > max.x ) {

			this.x = max.x;

		}

		if ( this.y < min.y ) {

			this.y = min.y;

		} else if ( this.y > max.y ) {

			this.y = max.y;

		}

		if ( this.z < min.z ) {

			this.z = min.z;

		} else if ( this.z > max.z ) {

			this.z = max.z;

		}

		return this;

	},

	clampScalar: function () {

		var min, max;

		return function clampScalar( minVal, maxVal ) {

			if ( min === undefined ) {

				min = new LmvVector3();
				max = new LmvVector3();

			}

			min.set( minVal, minVal, minVal );
			max.set( maxVal, maxVal, maxVal );

			return this.clamp( min, max );

		};

	}(),

	floor: function () {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );
		this.z = Math.floor( this.z );

		return this;

	},

	ceil: function () {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );
		this.z = Math.ceil( this.z );

		return this;

	},

	round: function () {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );
		this.z = Math.round( this.z );

		return this;

	},

	roundToZero: function () {

		this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
		this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );

		return this;

	},

	negate: function () {

		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;

		return this;

	},

	dot: function ( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	},

	lengthSq: function () {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	},

	length: function () {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	},

	lengthManhattan: function () {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	},

	normalize: function () {

		return this.divideScalar( this.length() );

	},

	setLength: function ( l ) {

		var oldLength = this.length();

		if ( oldLength !== 0 && l !== oldLength  ) {

			this.multiplyScalar( l / oldLength );

		}

		return this;

	},

	lerp: function ( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;

		return this;

	},

	lerpVectors: function ( v1, v2, alpha ) {

		this.subVectors( v2, v1 ).multiplyScalar( alpha ).add( v1 );

		return this;

	},

	cross: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.' );
			return this.crossVectors( v, w );

		}

		var x = this.x, y = this.y, z = this.z;

		this.x = y * v.z - z * v.y;
		this.y = z * v.x - x * v.z;
		this.z = x * v.y - y * v.x;

		return this;

	},

	crossVectors: function ( a, b ) {

		var ax = a.x, ay = a.y, az = a.z;
		var bx = b.x, by = b.y, bz = b.z;

		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;

		return this;

	},

	projectOnVector: function () {

		var v1, dot;

		return function projectOnVector( vector ) {

			if ( v1 === undefined ) v1 = new LmvVector3();

			v1.copy( vector ).normalize();

			dot = this.dot( v1 );

			return this.copy( v1 ).multiplyScalar( dot );

		};

	}(),

	projectOnPlane: function () {

		var v1;

		return function projectOnPlane( planeNormal ) {

			if ( v1 === undefined ) v1 = new LmvVector3();

			v1.copy( this ).projectOnVector( planeNormal );

			return this.sub( v1 );

		}

	}(),

	reflect: function () {

		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length

		var v1;

		return function reflect( normal ) {

			if ( v1 === undefined ) v1 = new LmvVector3();

			return this.sub( v1.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

		}

	}(),

	distanceTo: function ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	},

	distanceToSquared: function ( v ) {

		var dx = this.x - v.x;
		var dy = this.y - v.y;
		var dz = this.z - v.z;

		return dx * dx + dy * dy + dz * dz;

	},

	setEulerFromRotationMatrix: function ( m, order ) {

		console.error( 'THREE.Vector3: .setEulerFromRotationMatrix() has been removed. Use Euler.setFromRotationMatrix() instead.' );

	},

	setEulerFromQuaternion: function ( q, order ) {

		console.error( 'THREE.Vector3: .setEulerFromQuaternion() has been removed. Use Euler.setFromQuaternion() instead.' );

	},

	getPositionFromMatrix: function ( m ) {

		console.warn( 'THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition().' );

		return this.setFromMatrixPosition( m );

	},

	getScaleFromMatrix: function ( m ) {

		console.warn( 'THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale().' );

		return this.setFromMatrixScale( m );

	},

	getColumnFromMatrix: function ( index, matrix ) {

		console.warn( 'THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn().' );

		return this.setFromMatrixColumn( index, matrix );

	},

	setFromMatrixPosition: function ( m ) {

		this.x = m.elements[ 12 ];
		this.y = m.elements[ 13 ];
		this.z = m.elements[ 14 ];

		return this;

	},

	setFromMatrixScale: function ( m ) {

		var sx = this.set( m.elements[ 0 ], m.elements[ 1 ], m.elements[ 2 ] ).length();
		var sy = this.set( m.elements[ 4 ], m.elements[ 5 ], m.elements[ 6 ] ).length();
		var sz = this.set( m.elements[ 8 ], m.elements[ 9 ], m.elements[ 10 ] ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

		return this;

	},

	setFromMatrixColumn: function ( index, matrix ) {

		var offset = index * 4;

		var me = matrix.elements;

		this.x = me[ offset ];
		this.y = me[ offset + 1 ];
		this.z = me[ offset + 2 ];

		return this;

	},

	equals: function ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	},

	fromArray: function ( array, offset ) {

		if ( offset === undefined ) offset = 0;

		this.x = array[ offset ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;

	},

	toArray: function ( array, offset ) {

		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;

		return array;

	},

	fromAttribute: function ( attribute, index, offset ) {

		if ( offset === undefined ) offset = 0;

		index = index * attribute.itemSize + offset;

		this.x = attribute.array[ index ];
		this.y = attribute.array[ index + 1 ];
		this.z = attribute.array[ index + 2 ];

		return this;

	}

};

/**
 * @author bhouston / http://exocortex.com
 * @author WestLangley / http://github.com/WestLangley
 */
/* Pruned version of THREE.Box3, for use in the LMV web worker */


var LmvBox3 = function ( min, max ) {

	this.min = ( min !== undefined ) ? min : new LmvVector3( Infinity, Infinity, Infinity );
	this.max = ( max !== undefined ) ? max : new LmvVector3( - Infinity, - Infinity, - Infinity );

};

LmvBox3.prototype = {

	constructor: LmvBox3,

	set: function ( min, max ) {

		this.min.copy( min );
		this.max.copy( max );

		return this;

	},

	setFromPoints: function ( points ) {

		this.makeEmpty();

		for ( var i = 0, il = points.length; i < il; i ++ ) {

			this.expandByPoint( points[ i ] );

		}

		return this;

	},

	setFromArray: function ( array, offset ) {

		this.min.x = array[offset];
		this.min.y = array[offset+1];
		this.min.z = array[offset+2];

		this.max.x = array[offset+3];
		this.max.y = array[offset+4];
		this.max.z = array[offset+5];

		return this;

	},

	copyToArray: function (array, offset) {

		array[offset]   = this.min.x;
		array[offset+1] = this.min.y;
		array[offset+2] = this.min.z;

		array[offset+3] = this.max.x;
		array[offset+4] = this.max.y;
		array[offset+5] = this.max.z;

	},

	setFromCenterAndSize: function () {

		var v1 = new LmvVector3();

		return function ( center, size ) {

			var halfSize = v1.copy( size ).multiplyScalar( 0.5 );

			this.min.copy( center ).sub( halfSize );
			this.max.copy( center ).add( halfSize );

			return this;

		};

	}(),

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( box ) {

		this.min.copy( box.min );
		this.max.copy( box.max );

		return this;

	},

	makeEmpty: function () {

		this.min.x = this.min.y = this.min.z = Infinity;
		this.max.x = this.max.y = this.max.z = - Infinity;

		return this;

	},

	empty: function () {

		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

		return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y ) || ( this.max.z < this.min.z );

	},

	center: function ( optionalTarget ) {

		var result = optionalTarget || new LmvVector3();
		return result.addVectors( this.min, this.max ).multiplyScalar( 0.5 );

	},

	size: function ( optionalTarget ) {

		var result = optionalTarget || new LmvVector3();
		return result.subVectors( this.max, this.min );

	},

	expandByPoint: function ( point ) {

		this.min.min( point );
		this.max.max( point );

		return this;

	},

	expandByVector: function ( vector ) {

		this.min.sub( vector );
		this.max.add( vector );

		return this;

	},

	expandByScalar: function ( scalar ) {

		this.min.addScalar( - scalar );
		this.max.addScalar( scalar );

		return this;

	},

	containsPoint: function ( point ) {

		if ( point.x < this.min.x || point.x > this.max.x ||
		     point.y < this.min.y || point.y > this.max.y ||
		     point.z < this.min.z || point.z > this.max.z ) {

			return false;

		}

		return true;

	},

	containsBox: function ( box ) {

		if ( ( this.min.x <= box.min.x ) && ( box.max.x <= this.max.x ) &&
			 ( this.min.y <= box.min.y ) && ( box.max.y <= this.max.y ) &&
			 ( this.min.z <= box.min.z ) && ( box.max.z <= this.max.z ) ) {

			return true;

		}

		return false;

	},

	getParameter: function ( point, optionalTarget ) {

		// This can potentially have a divide by zero if the box
		// has a size dimension of 0.

		var result = optionalTarget || new LmvVector3();

		return result.set(
			( point.x - this.min.x ) / ( this.max.x - this.min.x ),
			( point.y - this.min.y ) / ( this.max.y - this.min.y ),
			( point.z - this.min.z ) / ( this.max.z - this.min.z )
		);

	},

	isIntersectionBox: function ( box ) {

		// using 6 splitting planes to rule out intersections.

		if ( box.max.x < this.min.x || box.min.x > this.max.x ||
		     box.max.y < this.min.y || box.min.y > this.max.y ||
		     box.max.z < this.min.z || box.min.z > this.max.z ) {

			return false;

		}

		return true;

	},

	clampPoint: function ( point, optionalTarget ) {

		var result = optionalTarget || new LmvVector3();
		return result.copy( point ).clamp( this.min, this.max );

	},

	distanceToPoint: function () {

		var v1 = new LmvVector3();

		return function ( point ) {

			var clampedPoint = v1.copy( point ).clamp( this.min, this.max );
			return clampedPoint.sub( point ).length();

		};

	}(),

	intersect: function ( box ) {

		this.min.max( box.min );
		this.max.min( box.max );

		return this;

	},

	union: function ( box ) {

		this.min.min( box.min );
		this.max.max( box.max );

		return this;

	},

	applyMatrix4: function () {

		var points = [
			new LmvVector3(),
			new LmvVector3(),
			new LmvVector3(),
			new LmvVector3(),
			new LmvVector3(),
			new LmvVector3(),
			new LmvVector3(),
			new LmvVector3()
		];

		return function ( matrix ) {

			// NOTE: I am using a binary pattern to specify all 2^3 combinations below
			points[ 0 ].set( this.min.x, this.min.y, this.min.z ).applyMatrix4( matrix ); // 000
			points[ 1 ].set( this.min.x, this.min.y, this.max.z ).applyMatrix4( matrix ); // 001
			points[ 2 ].set( this.min.x, this.max.y, this.min.z ).applyMatrix4( matrix ); // 010
			points[ 3 ].set( this.min.x, this.max.y, this.max.z ).applyMatrix4( matrix ); // 011
			points[ 4 ].set( this.max.x, this.min.y, this.min.z ).applyMatrix4( matrix ); // 100
			points[ 5 ].set( this.max.x, this.min.y, this.max.z ).applyMatrix4( matrix ); // 101
			points[ 6 ].set( this.max.x, this.max.y, this.min.z ).applyMatrix4( matrix ); // 110
			points[ 7 ].set( this.max.x, this.max.y, this.max.z ).applyMatrix4( matrix );  // 111

			this.makeEmpty();
			this.setFromPoints( points );

			return this;

		};

	}(),

	translate: function ( offset ) {

		this.min.add( offset );
		this.max.add( offset );

		return this;

	},

	equals: function ( box ) {

		return box.min.equals( this.min ) && box.max.equals( this.max );

	}

};

/**
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author timknip / http://www.floorplanner.com/
 * @author bhouston / http://exocortex.com
 * @author WestLangley / http://github.com/WestLangley
 */
/* Pruned version of THREE.Matrix4, for use in the LMV web worker */

LmvMatrix4 = function (useDoublePrecision) {

	if (useDoublePrecision) {

		this.elements = new Float64Array( [

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		] );

	} else {

		this.elements = new Float32Array( [

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		] );

	}

};

LmvMatrix4.prototype = {

	constructor: LmvMatrix4,

	set: function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

		var te = this.elements;

		te[ 0 ] = n11; te[ 4 ] = n12; te[ 8 ] = n13; te[ 12 ] = n14;
		te[ 1 ] = n21; te[ 5 ] = n22; te[ 9 ] = n23; te[ 13 ] = n24;
		te[ 2 ] = n31; te[ 6 ] = n32; te[ 10 ] = n33; te[ 14 ] = n34;
		te[ 3 ] = n41; te[ 7 ] = n42; te[ 11 ] = n43; te[ 15 ] = n44;

		return this;

	},

	identity: function () {

		this.set(

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		);

		return this;

	},

	copy: function ( m ) {

		this.elements.set( m.elements );

		return this;

	},

	makeRotationFromQuaternion: function ( q ) {

		var te = this.elements;

		var x = q.x, y = q.y, z = q.z, w = q.w;
		var x2 = x + x, y2 = y + y, z2 = z + z;
		var xx = x * x2, xy = x * y2, xz = x * z2;
		var yy = y * y2, yz = y * z2, zz = z * z2;
		var wx = w * x2, wy = w * y2, wz = w * z2;

		te[ 0 ] = 1 - ( yy + zz );
		te[ 4 ] = xy - wz;
		te[ 8 ] = xz + wy;

		te[ 1 ] = xy + wz;
		te[ 5 ] = 1 - ( xx + zz );
		te[ 9 ] = yz - wx;

		te[ 2 ] = xz - wy;
		te[ 6 ] = yz + wx;
		te[ 10 ] = 1 - ( xx + yy );

		// last column
		te[ 3 ] = 0;
		te[ 7 ] = 0;
		te[ 11 ] = 0;

		// bottom row
		te[ 12 ] = 0;
		te[ 13 ] = 0;
		te[ 14 ] = 0;
		te[ 15 ] = 1;

		return this;

	},

	multiply: function ( n ) {

		return this.multiplyMatrices( this, n );

	},

	multiplyMatrices: function ( a, b ) {

		var ae = a.elements;
		var be = b.elements;
		var te = this.elements;

		var a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
		var a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
		var a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
		var a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];

		var b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
		var b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
		var b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
		var b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];

		te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		te[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		te[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		te[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		te[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		te[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		te[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		te[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		te[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		te[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		te[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		te[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		te[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		te[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

		return this;

	},

	multiplyToArray: function ( a, b, r ) {

		var te = this.elements;

		this.multiplyMatrices( a, b );

		r[ 0 ] = te[ 0 ]; r[ 1 ] = te[ 1 ]; r[ 2 ] = te[ 2 ]; r[ 3 ] = te[ 3 ];
		r[ 4 ] = te[ 4 ]; r[ 5 ] = te[ 5 ]; r[ 6 ] = te[ 6 ]; r[ 7 ] = te[ 7 ];
		r[ 8 ]  = te[ 8 ]; r[ 9 ]  = te[ 9 ]; r[ 10 ] = te[ 10 ]; r[ 11 ] = te[ 11 ];
		r[ 12 ] = te[ 12 ]; r[ 13 ] = te[ 13 ]; r[ 14 ] = te[ 14 ]; r[ 15 ] = te[ 15 ];

		return this;

	},

	multiplyScalar: function ( s ) {

		var te = this.elements;

		te[ 0 ] *= s; te[ 4 ] *= s; te[ 8 ] *= s; te[ 12 ] *= s;
		te[ 1 ] *= s; te[ 5 ] *= s; te[ 9 ] *= s; te[ 13 ] *= s;
		te[ 2 ] *= s; te[ 6 ] *= s; te[ 10 ] *= s; te[ 14 ] *= s;
		te[ 3 ] *= s; te[ 7 ] *= s; te[ 11 ] *= s; te[ 15 ] *= s;

		return this;

	},

	determinant: function () {

		var te = this.elements;

		var n11 = te[ 0 ], n12 = te[ 4 ], n13 = te[ 8 ], n14 = te[ 12 ];
		var n21 = te[ 1 ], n22 = te[ 5 ], n23 = te[ 9 ], n24 = te[ 13 ];
		var n31 = te[ 2 ], n32 = te[ 6 ], n33 = te[ 10 ], n34 = te[ 14 ];
		var n41 = te[ 3 ], n42 = te[ 7 ], n43 = te[ 11 ], n44 = te[ 15 ];

		//TODO: make this more efficient
		//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

		return (
			n41 * (
				+ n14 * n23 * n32
				 - n13 * n24 * n32
				 - n14 * n22 * n33
				 + n12 * n24 * n33
				 + n13 * n22 * n34
				 - n12 * n23 * n34
			) +
			n42 * (
				+ n11 * n23 * n34
				 - n11 * n24 * n33
				 + n14 * n21 * n33
				 - n13 * n21 * n34
				 + n13 * n24 * n31
				 - n14 * n23 * n31
			) +
			n43 * (
				+ n11 * n24 * n32
				 - n11 * n22 * n34
				 - n14 * n21 * n32
				 + n12 * n21 * n34
				 + n14 * n22 * n31
				 - n12 * n24 * n31
			) +
			n44 * (
				- n13 * n22 * n31
				 - n11 * n23 * n32
				 + n11 * n22 * n33
				 + n13 * n21 * n32
				 - n12 * n21 * n33
				 + n12 * n23 * n31
			)

		);

	},

	transpose: function () {

		var te = this.elements;
		var tmp;

		tmp = te[ 1 ]; te[ 1 ] = te[ 4 ]; te[ 4 ] = tmp;
		tmp = te[ 2 ]; te[ 2 ] = te[ 8 ]; te[ 8 ] = tmp;
		tmp = te[ 6 ]; te[ 6 ] = te[ 9 ]; te[ 9 ] = tmp;

		tmp = te[ 3 ]; te[ 3 ] = te[ 12 ]; te[ 12 ] = tmp;
		tmp = te[ 7 ]; te[ 7 ] = te[ 13 ]; te[ 13 ] = tmp;
		tmp = te[ 11 ]; te[ 11 ] = te[ 14 ]; te[ 14 ] = tmp;

		return this;

	},

	flattenToArrayOffset: function ( array, offset ) {

		var te = this.elements;

		array[ offset     ] = te[ 0 ];
		array[ offset + 1 ] = te[ 1 ];
		array[ offset + 2 ] = te[ 2 ];
		array[ offset + 3 ] = te[ 3 ];

		array[ offset + 4 ] = te[ 4 ];
		array[ offset + 5 ] = te[ 5 ];
		array[ offset + 6 ] = te[ 6 ];
		array[ offset + 7 ] = te[ 7 ];

		array[ offset + 8 ]  = te[ 8 ];
		array[ offset + 9 ]  = te[ 9 ];
		array[ offset + 10 ] = te[ 10 ];
		array[ offset + 11 ] = te[ 11 ];

		array[ offset + 12 ] = te[ 12 ];
		array[ offset + 13 ] = te[ 13 ];
		array[ offset + 14 ] = te[ 14 ];
		array[ offset + 15 ] = te[ 15 ];

		return array;

	},

	setPosition: function ( v ) {

		var te = this.elements;

		te[ 12 ] = v.x;
		te[ 13 ] = v.y;
		te[ 14 ] = v.z;

		return this;

	},

	getInverse: function ( m, throwOnInvertible ) {

		// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
		var te = this.elements;
		var me = m.elements;

		var n11 = me[ 0 ], n12 = me[ 4 ], n13 = me[ 8 ], n14 = me[ 12 ];
		var n21 = me[ 1 ], n22 = me[ 5 ], n23 = me[ 9 ], n24 = me[ 13 ];
		var n31 = me[ 2 ], n32 = me[ 6 ], n33 = me[ 10 ], n34 = me[ 14 ];
		var n41 = me[ 3 ], n42 = me[ 7 ], n43 = me[ 11 ], n44 = me[ 15 ];

		te[ 0 ] = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
		te[ 4 ] = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
		te[ 8 ] = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
		te[ 12 ] = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
		te[ 1 ] = n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44;
		te[ 5 ] = n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44;
		te[ 9 ] = n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44;
		te[ 13 ] = n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34;
		te[ 2 ] = n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44;
		te[ 6 ] = n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44;
		te[ 10 ] = n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44;
		te[ 14 ] = n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34;
		te[ 3 ] = n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43;
		te[ 7 ] = n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43;
		te[ 11 ] = n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43;
		te[ 15 ] = n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33;

		var det = n11 * te[ 0 ] + n21 * te[ 4 ] + n31 * te[ 8 ] + n41 * te[ 12 ];

		if ( det == 0 ) {

			var msg = "Matrix4.getInverse(): can't invert matrix, determinant is 0";

			if ( throwOnInvertible || false ) {

				throw new Error( msg );

			} else {

				console.warn( msg );

			}

			this.identity();

			return this;
		}

		this.multiplyScalar( 1 / det );

		return this;

	},

	scale: function ( v ) {

		var te = this.elements;
		var x = v.x, y = v.y, z = v.z;

		te[ 0 ] *= x; te[ 4 ] *= y; te[ 8 ] *= z;
		te[ 1 ] *= x; te[ 5 ] *= y; te[ 9 ] *= z;
		te[ 2 ] *= x; te[ 6 ] *= y; te[ 10 ] *= z;
		te[ 3 ] *= x; te[ 7 ] *= y; te[ 11 ] *= z;

		return this;

	},

	makeTranslation: function ( x, y, z ) {

		this.set(

			1, 0, 0, x,
			0, 1, 0, y,
			0, 0, 1, z,
			0, 0, 0, 1

		);

		return this;

	},

	makeRotationX: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			1, 0,  0, 0,
			0, c, - s, 0,
			0, s,  c, 0,
			0, 0,  0, 1

		);

		return this;

	},

	makeRotationY: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			 c, 0, s, 0,
			 0, 1, 0, 0,
			- s, 0, c, 0,
			 0, 0, 0, 1

		);

		return this;

	},

	makeRotationZ: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			c, - s, 0, 0,
			s,  c, 0, 0,
			0,  0, 1, 0,
			0,  0, 0, 1

		);

		return this;

	},

	makeRotationAxis: function ( axis, angle ) {

		// Based on http://www.gamedev.net/reference/articles/article1199.asp

		var c = Math.cos( angle );
		var s = Math.sin( angle );
		var t = 1 - c;
		var x = axis.x, y = axis.y, z = axis.z;
		var tx = t * x, ty = t * y;

		this.set(

			tx * x + c, tx * y - s * z, tx * z + s * y, 0,
			tx * y + s * z, ty * y + c, ty * z - s * x, 0,
			tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
			0, 0, 0, 1

		);

		 return this;

	},

	makeScale: function ( x, y, z ) {

		this.set(

			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1

		);

		return this;

	},

	compose: function ( position, quaternion, scale ) {

		this.makeRotationFromQuaternion( quaternion );
		this.scale( scale );
		this.setPosition( position );

		return this;

	},

    //Added for LMV
    transformPoint: function (pt) {

            // input: THREE.Matrix4 affine matrix

            var x = pt.x, y = pt.y, z = pt.z;

            var e = this.elements;

            pt.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z + e[ 12 ];
            pt.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z + e[ 13 ];
            pt.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ];

            return pt;
    },

    //Added for LMV
    transformDirection: function(v) {

            // input: THREE.Matrix4 affine matrix
            // vector interpreted as a direction

            var x = v.x, y = v.y, z = v.z;

            var e = this.elements;

            v.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z;
            v.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z;
            v.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

            var len = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
            if (len > 0) {
                var ilen = 1.0 / len;
                v.x *= ilen;
                v.y *= ilen;
                v.z *= ilen;
            }

            return v;
    },


	fromArray: function ( array ) {

		this.elements.set( array );

		return this;

	},

	toArray: function () {

		var te = this.elements;

		return [
			te[ 0 ], te[ 1 ], te[ 2 ], te[ 3 ],
			te[ 4 ], te[ 5 ], te[ 6 ], te[ 7 ],
			te[ 8 ], te[ 9 ], te[ 10 ], te[ 11 ],
			te[ 12 ], te[ 13 ], te[ 14 ], te[ 15 ]
		];

	},

	clone: function () {

		return new LmvMatrix4().fromArray( this.elements );

	}

};

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

/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */(function() {'use strict';function m(a){throw a;}var p=void 0,t,aa=this;function v(a,b){var c=a.split("."),d=aa;!(c[0]in d)&&d.execScript&&d.execScript("var "+c[0]);for(var g;c.length&&(g=c.shift());)!c.length&&b!==p?d[g]=b:d=d[g]?d[g]:d[g]={}};var w="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array;new (w?Uint8Array:Array)(256);var x;for(x=0;256>x;++x)for(var y=x,ba=7,y=y>>>1;y;y>>>=1)--ba;var z=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,
2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,
2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,
2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,
3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,
936918E3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],A=w?new Uint32Array(z):z;function B(a){var b=a.length,c=0,d=Number.POSITIVE_INFINITY,g,f,h,e,k,l,q,s,r;for(s=0;s<b;++s)a[s]>c&&(c=a[s]),a[s]<d&&(d=a[s]);g=1<<c;f=new (w?Uint32Array:Array)(g);h=1;e=0;for(k=2;h<=c;){for(s=0;s<b;++s)if(a[s]===h){l=0;q=e;for(r=0;r<h;++r)l=l<<1|q&1,q>>=1;for(r=l;r<g;r+=k)f[r]=h<<16|s;++e}++h;e<<=1;k<<=1}return[f,c,d]};var C=[],D;for(D=0;288>D;D++)switch(!0){case 143>=D:C.push([D+48,8]);break;case 255>=D:C.push([D-144+400,9]);break;case 279>=D:C.push([D-256+0,7]);break;case 287>=D:C.push([D-280+192,8]);break;default:m("invalid literal: "+D)}
var ca=function(){function a(a){switch(!0){case 3===a:return[257,a-3,0];case 4===a:return[258,a-4,0];case 5===a:return[259,a-5,0];case 6===a:return[260,a-6,0];case 7===a:return[261,a-7,0];case 8===a:return[262,a-8,0];case 9===a:return[263,a-9,0];case 10===a:return[264,a-10,0];case 12>=a:return[265,a-11,1];case 14>=a:return[266,a-13,1];case 16>=a:return[267,a-15,1];case 18>=a:return[268,a-17,1];case 22>=a:return[269,a-19,2];case 26>=a:return[270,a-23,2];case 30>=a:return[271,a-27,2];case 34>=a:return[272,
a-31,2];case 42>=a:return[273,a-35,3];case 50>=a:return[274,a-43,3];case 58>=a:return[275,a-51,3];case 66>=a:return[276,a-59,3];case 82>=a:return[277,a-67,4];case 98>=a:return[278,a-83,4];case 114>=a:return[279,a-99,4];case 130>=a:return[280,a-115,4];case 162>=a:return[281,a-131,5];case 194>=a:return[282,a-163,5];case 226>=a:return[283,a-195,5];case 257>=a:return[284,a-227,5];case 258===a:return[285,a-258,0];default:m("invalid length: "+a)}}var b=[],c,d;for(c=3;258>=c;c++)d=a(c),b[c]=d[2]<<24|d[1]<<
16|d[0];return b}();w&&new Uint32Array(ca);function E(a,b){this.l=[];this.m=32768;this.d=this.f=this.c=this.t=0;this.input=w?new Uint8Array(a):a;this.u=!1;this.n=F;this.K=!1;if(b||!(b={}))b.index&&(this.c=b.index),b.bufferSize&&(this.m=b.bufferSize),b.bufferType&&(this.n=b.bufferType),b.resize&&(this.K=b.resize);switch(this.n){case G:this.a=32768;this.b=new (w?Uint8Array:Array)(32768+this.m+258);break;case F:this.a=0;this.b=new (w?Uint8Array:Array)(this.m);this.e=this.W;this.B=this.R;this.q=this.V;break;default:m(Error("invalid inflate mode"))}}
var G=0,F=1;
E.prototype.r=function(){for(;!this.u;){var a=H(this,3);a&1&&(this.u=!0);a>>>=1;switch(a){case 0:var b=this.input,c=this.c,d=this.b,g=this.a,f=p,h=p,e=p,k=d.length,l=p;this.d=this.f=0;f=b[c++];f===p&&m(Error("invalid uncompressed block header: LEN (first byte)"));h=f;f=b[c++];f===p&&m(Error("invalid uncompressed block header: LEN (second byte)"));h|=f<<8;f=b[c++];f===p&&m(Error("invalid uncompressed block header: NLEN (first byte)"));e=f;f=b[c++];f===p&&m(Error("invalid uncompressed block header: NLEN (second byte)"));e|=
f<<8;h===~e&&m(Error("invalid uncompressed block header: length verify"));c+h>b.length&&m(Error("input buffer is broken"));switch(this.n){case G:for(;g+h>d.length;){l=k-g;h-=l;if(w)d.set(b.subarray(c,c+l),g),g+=l,c+=l;else for(;l--;)d[g++]=b[c++];this.a=g;d=this.e();g=this.a}break;case F:for(;g+h>d.length;)d=this.e({H:2});break;default:m(Error("invalid inflate mode"))}if(w)d.set(b.subarray(c,c+h),g),g+=h,c+=h;else for(;h--;)d[g++]=b[c++];this.c=c;this.a=g;this.b=d;break;case 1:this.q(da,ea);break;
case 2:fa(this);break;default:m(Error("unknown BTYPE: "+a))}}return this.B()};
var I=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],J=w?new Uint16Array(I):I,K=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],L=w?new Uint16Array(K):K,ga=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],O=w?new Uint8Array(ga):ga,ha=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],ia=w?new Uint16Array(ha):ha,ja=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,
12,12,13,13],P=w?new Uint8Array(ja):ja,Q=new (w?Uint8Array:Array)(288),R,la;R=0;for(la=Q.length;R<la;++R)Q[R]=143>=R?8:255>=R?9:279>=R?7:8;var da=B(Q),S=new (w?Uint8Array:Array)(30),T,ma;T=0;for(ma=S.length;T<ma;++T)S[T]=5;var ea=B(S);function H(a,b){for(var c=a.f,d=a.d,g=a.input,f=a.c,h;d<b;)h=g[f++],h===p&&m(Error("input buffer is broken")),c|=h<<d,d+=8;h=c&(1<<b)-1;a.f=c>>>b;a.d=d-b;a.c=f;return h}
function U(a,b){for(var c=a.f,d=a.d,g=a.input,f=a.c,h=b[0],e=b[1],k,l,q;d<e;){k=g[f++];if(k===p)break;c|=k<<d;d+=8}l=h[c&(1<<e)-1];q=l>>>16;a.f=c>>q;a.d=d-q;a.c=f;return l&65535}
function fa(a){function b(a,b,c){var d,e,f,g;for(g=0;g<a;)switch(d=U(this,b),d){case 16:for(f=3+H(this,2);f--;)c[g++]=e;break;case 17:for(f=3+H(this,3);f--;)c[g++]=0;e=0;break;case 18:for(f=11+H(this,7);f--;)c[g++]=0;e=0;break;default:e=c[g++]=d}return c}var c=H(a,5)+257,d=H(a,5)+1,g=H(a,4)+4,f=new (w?Uint8Array:Array)(J.length),h,e,k,l;for(l=0;l<g;++l)f[J[l]]=H(a,3);h=B(f);e=new (w?Uint8Array:Array)(c);k=new (w?Uint8Array:Array)(d);a.q(B(b.call(a,c,h,e)),B(b.call(a,d,h,k)))}t=E.prototype;
t.q=function(a,b){var c=this.b,d=this.a;this.C=a;for(var g=c.length-258,f,h,e,k;256!==(f=U(this,a));)if(256>f)d>=g&&(this.a=d,c=this.e(),d=this.a),c[d++]=f;else{h=f-257;k=L[h];0<O[h]&&(k+=H(this,O[h]));f=U(this,b);e=ia[f];0<P[f]&&(e+=H(this,P[f]));d>=g&&(this.a=d,c=this.e(),d=this.a);for(;k--;)c[d]=c[d++-e]}for(;8<=this.d;)this.d-=8,this.c--;this.a=d};
t.V=function(a,b){var c=this.b,d=this.a;this.C=a;for(var g=c.length,f,h,e,k;256!==(f=U(this,a));)if(256>f)d>=g&&(c=this.e(),g=c.length),c[d++]=f;else{h=f-257;k=L[h];0<O[h]&&(k+=H(this,O[h]));f=U(this,b);e=ia[f];0<P[f]&&(e+=H(this,P[f]));d+k>g&&(c=this.e(),g=c.length);for(;k--;)c[d]=c[d++-e]}for(;8<=this.d;)this.d-=8,this.c--;this.a=d};
t.e=function(){var a=new (w?Uint8Array:Array)(this.a-32768),b=this.a-32768,c,d,g=this.b;if(w)a.set(g.subarray(32768,a.length));else{c=0;for(d=a.length;c<d;++c)a[c]=g[c+32768]}this.l.push(a);this.t+=a.length;if(w)g.set(g.subarray(b,b+32768));else for(c=0;32768>c;++c)g[c]=g[b+c];this.a=32768;return g};
t.W=function(a){var b,c=this.input.length/this.c+1|0,d,g,f,h=this.input,e=this.b;a&&("number"===typeof a.H&&(c=a.H),"number"===typeof a.P&&(c+=a.P));2>c?(d=(h.length-this.c)/this.C[2],f=258*(d/2)|0,g=f<e.length?e.length+f:e.length<<1):g=e.length*c;w?(b=new Uint8Array(g),b.set(e)):b=e;return this.b=b};
t.B=function(){var a=0,b=this.b,c=this.l,d,g=new (w?Uint8Array:Array)(this.t+(this.a-32768)),f,h,e,k;if(0===c.length)return w?this.b.subarray(32768,this.a):this.b.slice(32768,this.a);f=0;for(h=c.length;f<h;++f){d=c[f];e=0;for(k=d.length;e<k;++e)g[a++]=d[e]}f=32768;for(h=this.a;f<h;++f)g[a++]=b[f];this.l=[];return this.buffer=g};
t.R=function(){var a,b=this.a;w?this.K?(a=new Uint8Array(b),a.set(this.b.subarray(0,b))):a=this.b.subarray(0,b):(this.b.length>b&&(this.b.length=b),a=this.b);return this.buffer=a};function V(a){a=a||{};this.files=[];this.v=a.comment}V.prototype.L=function(a){this.j=a};V.prototype.s=function(a){var b=a[2]&65535|2;return b*(b^1)>>8&255};V.prototype.k=function(a,b){a[0]=(A[(a[0]^b)&255]^a[0]>>>8)>>>0;a[1]=(6681*(20173*(a[1]+(a[0]&255))>>>0)>>>0)+1>>>0;a[2]=(A[(a[2]^a[1]>>>24)&255]^a[2]>>>8)>>>0};V.prototype.T=function(a){var b=[305419896,591751049,878082192],c,d;w&&(b=new Uint32Array(b));c=0;for(d=a.length;c<d;++c)this.k(b,a[c]&255);return b};function W(a,b){b=b||{};this.input=w&&a instanceof Array?new Uint8Array(a):a;this.c=0;this.ba=b.verify||!1;this.j=b.password}var na={O:0,M:8},X=[80,75,1,2],Y=[80,75,3,4],Z=[80,75,5,6];function oa(a,b){this.input=a;this.offset=b}
oa.prototype.parse=function(){var a=this.input,b=this.offset;(a[b++]!==X[0]||a[b++]!==X[1]||a[b++]!==X[2]||a[b++]!==X[3])&&m(Error("invalid file header signature"));this.version=a[b++];this.ia=a[b++];this.Z=a[b++]|a[b++]<<8;this.I=a[b++]|a[b++]<<8;this.A=a[b++]|a[b++]<<8;this.time=a[b++]|a[b++]<<8;this.U=a[b++]|a[b++]<<8;this.p=(a[b++]|a[b++]<<8|a[b++]<<16|a[b++]<<24)>>>0;this.z=(a[b++]|a[b++]<<8|a[b++]<<16|a[b++]<<24)>>>0;this.J=(a[b++]|a[b++]<<8|a[b++]<<16|a[b++]<<24)>>>0;this.h=a[b++]|a[b++]<<
8;this.g=a[b++]|a[b++]<<8;this.F=a[b++]|a[b++]<<8;this.ea=a[b++]|a[b++]<<8;this.ga=a[b++]|a[b++]<<8;this.fa=a[b++]|a[b++]<<8|a[b++]<<16|a[b++]<<24;this.$=(a[b++]|a[b++]<<8|a[b++]<<16|a[b++]<<24)>>>0;this.filename=String.fromCharCode.apply(null,w?a.subarray(b,b+=this.h):a.slice(b,b+=this.h));this.X=w?a.subarray(b,b+=this.g):a.slice(b,b+=this.g);this.v=w?a.subarray(b,b+this.F):a.slice(b,b+this.F);this.length=b-this.offset};function pa(a,b){this.input=a;this.offset=b}var qa={N:1,ca:8,da:2048};
pa.prototype.parse=function(){var a=this.input,b=this.offset;(a[b++]!==Y[0]||a[b++]!==Y[1]||a[b++]!==Y[2]||a[b++]!==Y[3])&&m(Error("invalid local file header signature"));this.Z=a[b++]|a[b++]<<8;this.I=a[b++]|a[b++]<<8;this.A=a[b++]|a[b++]<<8;this.time=a[b++]|a[b++]<<8;this.U=a[b++]|a[b++]<<8;this.p=(a[b++]|a[b++]<<8|a[b++]<<16|a[b++]<<24)>>>0;this.z=(a[b++]|a[b++]<<8|a[b++]<<16|a[b++]<<24)>>>0;this.J=(a[b++]|a[b++]<<8|a[b++]<<16|a[b++]<<24)>>>0;this.h=a[b++]|a[b++]<<8;this.g=a[b++]|a[b++]<<8;this.filename=
String.fromCharCode.apply(null,w?a.subarray(b,b+=this.h):a.slice(b,b+=this.h));this.X=w?a.subarray(b,b+=this.g):a.slice(b,b+=this.g);this.length=b-this.offset};
function $(a){var b=[],c={},d,g,f,h;if(!a.i){if(a.o===p){var e=a.input,k;if(!a.D)a:{var l=a.input,q;for(q=l.length-12;0<q;--q)if(l[q]===Z[0]&&l[q+1]===Z[1]&&l[q+2]===Z[2]&&l[q+3]===Z[3]){a.D=q;break a}m(Error("End of Central Directory Record not found"))}k=a.D;(e[k++]!==Z[0]||e[k++]!==Z[1]||e[k++]!==Z[2]||e[k++]!==Z[3])&&m(Error("invalid signature"));a.ha=e[k++]|e[k++]<<8;a.ja=e[k++]|e[k++]<<8;a.ka=e[k++]|e[k++]<<8;a.aa=e[k++]|e[k++]<<8;a.Q=(e[k++]|e[k++]<<8|e[k++]<<16|e[k++]<<24)>>>0;a.o=(e[k++]|
e[k++]<<8|e[k++]<<16|e[k++]<<24)>>>0;a.w=e[k++]|e[k++]<<8;a.v=w?e.subarray(k,k+a.w):e.slice(k,k+a.w)}d=a.o;f=0;for(h=a.aa;f<h;++f)g=new oa(a.input,d),g.parse(),d+=g.length,b[f]=g,c[g.filename]=f;a.Q<d-a.o&&m(Error("invalid file header size"));a.i=b;a.G=c}}t=W.prototype;t.Y=function(){var a=[],b,c,d;this.i||$(this);d=this.i;b=0;for(c=d.length;b<c;++b)a[b]=d[b].filename;return a};
t.r=function(a,b){var c;this.G||$(this);c=this.G[a];c===p&&m(Error(a+" not found"));var d;d=b||{};var g=this.input,f=this.i,h,e,k,l,q,s,r,M;f||$(this);f[c]===p&&m(Error("wrong index"));e=f[c].$;h=new pa(this.input,e);h.parse();e+=h.length;k=h.z;if(0!==(h.I&qa.N)){!d.password&&!this.j&&m(Error("please set password"));s=this.S(d.password||this.j);r=e;for(M=e+12;r<M;++r)ra(this,s,g[r]);e+=12;k-=12;r=e;for(M=e+k;r<M;++r)g[r]=ra(this,s,g[r])}switch(h.A){case na.O:l=w?this.input.subarray(e,e+k):this.input.slice(e,
e+k);break;case na.M:l=(new E(this.input,{index:e,bufferSize:h.J})).r();break;default:m(Error("unknown compression type"))}if(this.ba){var u=p,n,N="number"===typeof u?u:u=0,ka=l.length;n=-1;for(N=ka&7;N--;++u)n=n>>>8^A[(n^l[u])&255];for(N=ka>>3;N--;u+=8)n=n>>>8^A[(n^l[u])&255],n=n>>>8^A[(n^l[u+1])&255],n=n>>>8^A[(n^l[u+2])&255],n=n>>>8^A[(n^l[u+3])&255],n=n>>>8^A[(n^l[u+4])&255],n=n>>>8^A[(n^l[u+5])&255],n=n>>>8^A[(n^l[u+6])&255],n=n>>>8^A[(n^l[u+7])&255];q=(n^4294967295)>>>0;h.p!==q&&m(Error("wrong crc: file=0x"+
h.p.toString(16)+", data=0x"+q.toString(16)))}return l};t.L=function(a){this.j=a};function ra(a,b,c){c^=a.s(b);a.k(b,c);return c}t.k=V.prototype.k;t.S=V.prototype.T;t.s=V.prototype.s;v("Zlib.Unzip",W);v("Zlib.Unzip.prototype.decompress",W.prototype.r);v("Zlib.Unzip.prototype.getFilenames",W.prototype.Y);v("Zlib.Unzip.prototype.setPassword",W.prototype.L);}).call(this);

/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */(function() {'use strict';function m(b){throw b;}var n=void 0,r=this;function s(b,d){var a=b.split("."),c=r;!(a[0]in c)&&c.execScript&&c.execScript("var "+a[0]);for(var f;a.length&&(f=a.shift());)!a.length&&d!==n?c[f]=d:c=c[f]?c[f]:c[f]={}};var u="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array;function v(b){var d=b.length,a=0,c=Number.POSITIVE_INFINITY,f,e,g,h,k,l,q,p,t;for(p=0;p<d;++p)b[p]>a&&(a=b[p]),b[p]<c&&(c=b[p]);f=1<<a;e=new (u?Uint32Array:Array)(f);g=1;h=0;for(k=2;g<=a;){for(p=0;p<d;++p)if(b[p]===g){l=0;q=h;for(t=0;t<g;++t)l=l<<1|q&1,q>>=1;for(t=l;t<f;t+=k)e[t]=g<<16|p;++h}++g;h<<=1;k<<=1}return[e,a,c]};function w(b,d){this.g=[];this.h=32768;this.d=this.f=this.a=this.l=0;this.input=u?new Uint8Array(b):b;this.m=!1;this.i=x;this.r=!1;if(d||!(d={}))d.index&&(this.a=d.index),d.bufferSize&&(this.h=d.bufferSize),d.bufferType&&(this.i=d.bufferType),d.resize&&(this.r=d.resize);switch(this.i){case y:this.b=32768;this.c=new (u?Uint8Array:Array)(32768+this.h+258);break;case x:this.b=0;this.c=new (u?Uint8Array:Array)(this.h);this.e=this.z;this.n=this.v;this.j=this.w;break;default:m(Error("invalid inflate mode"))}}
var y=0,x=1,z={t:y,s:x};
w.prototype.k=function(){for(;!this.m;){var b=A(this,3);b&1&&(this.m=!0);b>>>=1;switch(b){case 0:var d=this.input,a=this.a,c=this.c,f=this.b,e=n,g=n,h=n,k=c.length,l=n;this.d=this.f=0;e=d[a++];e===n&&m(Error("invalid uncompressed block header: LEN (first byte)"));g=e;e=d[a++];e===n&&m(Error("invalid uncompressed block header: LEN (second byte)"));g|=e<<8;e=d[a++];e===n&&m(Error("invalid uncompressed block header: NLEN (first byte)"));h=e;e=d[a++];e===n&&m(Error("invalid uncompressed block header: NLEN (second byte)"));h|=
e<<8;g===~h&&m(Error("invalid uncompressed block header: length verify"));a+g>d.length&&m(Error("input buffer is broken"));switch(this.i){case y:for(;f+g>c.length;){l=k-f;g-=l;if(u)c.set(d.subarray(a,a+l),f),f+=l,a+=l;else for(;l--;)c[f++]=d[a++];this.b=f;c=this.e();f=this.b}break;case x:for(;f+g>c.length;)c=this.e({p:2});break;default:m(Error("invalid inflate mode"))}if(u)c.set(d.subarray(a,a+g),f),f+=g,a+=g;else for(;g--;)c[f++]=d[a++];this.a=a;this.b=f;this.c=c;break;case 1:this.j(B,C);break;case 2:aa(this);
break;default:m(Error("unknown BTYPE: "+b))}}return this.n()};
var D=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],E=u?new Uint16Array(D):D,F=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],G=u?new Uint16Array(F):F,H=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],I=u?new Uint8Array(H):H,J=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],K=u?new Uint16Array(J):J,L=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,
13],M=u?new Uint8Array(L):L,N=new (u?Uint8Array:Array)(288),O,P;O=0;for(P=N.length;O<P;++O)N[O]=143>=O?8:255>=O?9:279>=O?7:8;var B=v(N),Q=new (u?Uint8Array:Array)(30),R,S;R=0;for(S=Q.length;R<S;++R)Q[R]=5;var C=v(Q);function A(b,d){for(var a=b.f,c=b.d,f=b.input,e=b.a,g;c<d;)g=f[e++],g===n&&m(Error("input buffer is broken")),a|=g<<c,c+=8;g=a&(1<<d)-1;b.f=a>>>d;b.d=c-d;b.a=e;return g}
function T(b,d){for(var a=b.f,c=b.d,f=b.input,e=b.a,g=d[0],h=d[1],k,l,q;c<h;){k=f[e++];if(k===n)break;a|=k<<c;c+=8}l=g[a&(1<<h)-1];q=l>>>16;b.f=a>>q;b.d=c-q;b.a=e;return l&65535}
function aa(b){function d(a,b,c){var d,e,f,g;for(g=0;g<a;)switch(d=T(this,b),d){case 16:for(f=3+A(this,2);f--;)c[g++]=e;break;case 17:for(f=3+A(this,3);f--;)c[g++]=0;e=0;break;case 18:for(f=11+A(this,7);f--;)c[g++]=0;e=0;break;default:e=c[g++]=d}return c}var a=A(b,5)+257,c=A(b,5)+1,f=A(b,4)+4,e=new (u?Uint8Array:Array)(E.length),g,h,k,l;for(l=0;l<f;++l)e[E[l]]=A(b,3);g=v(e);h=new (u?Uint8Array:Array)(a);k=new (u?Uint8Array:Array)(c);b.j(v(d.call(b,a,g,h)),v(d.call(b,c,g,k)))}
w.prototype.j=function(b,d){var a=this.c,c=this.b;this.o=b;for(var f=a.length-258,e,g,h,k;256!==(e=T(this,b));)if(256>e)c>=f&&(this.b=c,a=this.e(),c=this.b),a[c++]=e;else{g=e-257;k=G[g];0<I[g]&&(k+=A(this,I[g]));e=T(this,d);h=K[e];0<M[e]&&(h+=A(this,M[e]));c>=f&&(this.b=c,a=this.e(),c=this.b);for(;k--;)a[c]=a[c++-h]}for(;8<=this.d;)this.d-=8,this.a--;this.b=c};
w.prototype.w=function(b,d){var a=this.c,c=this.b;this.o=b;for(var f=a.length,e,g,h,k;256!==(e=T(this,b));)if(256>e)c>=f&&(a=this.e(),f=a.length),a[c++]=e;else{g=e-257;k=G[g];0<I[g]&&(k+=A(this,I[g]));e=T(this,d);h=K[e];0<M[e]&&(h+=A(this,M[e]));c+k>f&&(a=this.e(),f=a.length);for(;k--;)a[c]=a[c++-h]}for(;8<=this.d;)this.d-=8,this.a--;this.b=c};
w.prototype.e=function(){var b=new (u?Uint8Array:Array)(this.b-32768),d=this.b-32768,a,c,f=this.c;if(u)b.set(f.subarray(32768,b.length));else{a=0;for(c=b.length;a<c;++a)b[a]=f[a+32768]}this.g.push(b);this.l+=b.length;if(u)f.set(f.subarray(d,d+32768));else for(a=0;32768>a;++a)f[a]=f[d+a];this.b=32768;return f};
w.prototype.z=function(b){var d,a=this.input.length/this.a+1|0,c,f,e,g=this.input,h=this.c;b&&("number"===typeof b.p&&(a=b.p),"number"===typeof b.u&&(a+=b.u));2>a?(c=(g.length-this.a)/this.o[2],e=258*(c/2)|0,f=e<h.length?h.length+e:h.length<<1):f=h.length*a;u?(d=new Uint8Array(f),d.set(h)):d=h;return this.c=d};
w.prototype.n=function(){var b=0,d=this.c,a=this.g,c,f=new (u?Uint8Array:Array)(this.l+(this.b-32768)),e,g,h,k;if(0===a.length)return u?this.c.subarray(32768,this.b):this.c.slice(32768,this.b);e=0;for(g=a.length;e<g;++e){c=a[e];h=0;for(k=c.length;h<k;++h)f[b++]=c[h]}e=32768;for(g=this.b;e<g;++e)f[b++]=d[e];this.g=[];return this.buffer=f};
w.prototype.v=function(){var b,d=this.b;u?this.r?(b=new Uint8Array(d),b.set(this.c.subarray(0,d))):b=this.c.subarray(0,d):(this.c.length>d&&(this.c.length=d),b=this.c);return this.buffer=b};function U(b,d){var a,c;this.input=b;this.a=0;if(d||!(d={}))d.index&&(this.a=d.index),d.verify&&(this.A=d.verify);a=b[this.a++];c=b[this.a++];switch(a&15){case V:this.method=V;break;default:m(Error("unsupported compression method"))}0!==((a<<8)+c)%31&&m(Error("invalid fcheck flag:"+((a<<8)+c)%31));c&32&&m(Error("fdict flag is not supported"));this.q=new w(b,{index:this.a,bufferSize:d.bufferSize,bufferType:d.bufferType,resize:d.resize})}
U.prototype.k=function(){var b=this.input,d,a;d=this.q.k();this.a=this.q.a;if(this.A){a=(b[this.a++]<<24|b[this.a++]<<16|b[this.a++]<<8|b[this.a++])>>>0;var c=d;if("string"===typeof c){var f=c.split(""),e,g;e=0;for(g=f.length;e<g;e++)f[e]=(f[e].charCodeAt(0)&255)>>>0;c=f}for(var h=1,k=0,l=c.length,q,p=0;0<l;){q=1024<l?1024:l;l-=q;do h+=c[p++],k+=h;while(--q);h%=65521;k%=65521}a!==(k<<16|h)>>>0&&m(Error("invalid adler-32 checksum"))}return d};var V=8;s("Zlib.Inflate",U);s("Zlib.Inflate.prototype.decompress",U.prototype.k);var W={ADAPTIVE:z.s,BLOCK:z.t},X,Y,Z,$;if(Object.keys)X=Object.keys(W);else for(Y in X=[],Z=0,W)X[Z++]=Y;Z=0;for($=X.length;Z<$;++Z)Y=X[Z],s("Zlib.Inflate.BufferType."+Y,W[Y]);}).call(this);

/*! https://mths.be/base64 v<%= version %> by @mathias | MIT license */
;(function(root) {

	// Detect free variables `exports`.
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code, and use
	// it as `root`.
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var InvalidCharacterError = function(message) {
		this.message = message;
	};
	InvalidCharacterError.prototype = new Error;
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	var error = function(message) {
		// Note: the error messages used throughout this file match those used by
		// the native `atob`/`btoa` implementation in Chromium.
		throw new InvalidCharacterError(message);
	};

	var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	// http://whatwg.org/html/common-microsyntaxes.html#space-character
	var REGEX_SPACE_CHARACTERS = /<%= spaceCharacters %>/g;

	// `decode` is designed to be fully compatible with `atob` as described in the
	// HTML Standard. http://whatwg.org/html/webappapis.html#dom-windowbase64-atob
	// The optimized base64-decoding algorithm used is based on @atk’s excellent
	// implementation. https://gist.github.com/atk/1020396
	var decode = function(input) {
		input = String(input)
			.replace(REGEX_SPACE_CHARACTERS, '');
		var length = input.length;
		if (length % 4 == 0) {
			input = input.replace(/==?$/, '');
			length = input.length;
		}
		if (
			length % 4 == 1 ||
			// http://whatwg.org/C#alphanumeric-ascii-characters
			/[^+a-zA-Z0-9/]/.test(input)
		) {
			error(
				'Invalid character: the string to be decoded is not correctly encoded.'
			);
		}
		var bitCounter = 0;
		var bitStorage;
		var buffer;
		var output = '';
		var position = -1;
		while (++position < length) {
			buffer = TABLE.indexOf(input.charAt(position));
			bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;
			// Unless this is the first of a group of 4 characters…
			if (bitCounter++ % 4) {
				// …convert the first 8 bits to a single ASCII character.
				output += String.fromCharCode(
					0xFF & bitStorage >> (-2 * bitCounter & 6)
				);
			}
		}
		return output;
	};

	// `encode` is designed to be fully compatible with `btoa` as described in the
	// HTML Standard: http://whatwg.org/html/webappapis.html#dom-windowbase64-btoa
	var encode = function(input) {
		input = String(input);
		if (/[^\0-\xFF]/.test(input)) {
			// Note: no need to special-case astral symbols here, as surrogates are
			// matched, and the input is supposed to only contain ASCII anyway.
			error(
				'The string to be encoded contains characters outside of the ' +
				'Latin1 range.'
			);
		}
		var padding = input.length % 3;
		var output = '';
		var position = -1;
		var a;
		var b;
		var c;
		var d;
		var buffer;
		// Make sure any padding is handled outside of the loop.
		var length = input.length - padding;

		while (++position < length) {
			// Read three bytes, i.e. 24 bits.
			a = input.charCodeAt(position) << 16;
			b = input.charCodeAt(++position) << 8;
			c = input.charCodeAt(++position);
			buffer = a + b + c;
			// Turn the 24 bits into four chunks of 6 bits each, and append the
			// matching character for each of them to the output.
			output += (
				TABLE.charAt(buffer >> 18 & 0x3F) +
				TABLE.charAt(buffer >> 12 & 0x3F) +
				TABLE.charAt(buffer >> 6 & 0x3F) +
				TABLE.charAt(buffer & 0x3F)
			);
		}

		if (padding == 2) {
			a = input.charCodeAt(position) << 8;
			b = input.charCodeAt(++position);
			buffer = a + b;
			output += (
				TABLE.charAt(buffer >> 10) +
				TABLE.charAt((buffer >> 4) & 0x3F) +
				TABLE.charAt((buffer << 2) & 0x3F) +
				'='
			);
		} else if (padding == 1) {
			buffer = input.charCodeAt(position);
			output += (
				TABLE.charAt(buffer >> 2) +
				TABLE.charAt((buffer << 4) & 0x3F) +
				'=='
			);
		}

		return output;
	};

	var base64 = {
		'encode': encode,
		'decode': decode,
		'version': '<%= version %>'
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return base64;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = base64;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in base64) {
				base64.hasOwnProperty(key) && (freeExports[key] = base64[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.base64 = base64;
	}

}(this));

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

    return (this.vcount * mult + addCount > 32767);
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

var warnedGzip = false;

/** @constructor */
function PackFileReader(data)
{
    var stream = this.stream = new lmv.InputStream(data);

    var len = stream.getInt32();
    this.type = stream.getString(len);
    this.version = stream.getInt32();

    this.types = null;
    this.entryOffsets = [];

    //read the table of contents
    {
        // Jump to file footer.
        stream.seek(stream.byteLength - 8);

        // Jump to toc.
        var tocOffset = stream.getUint32();
        this.typesOffset = stream.getUint32();

        // Populate type sets.
        stream.seek(this.typesOffset);
        var typesCount = this.readU32V();
        this.types = [];
        for (var i = 0; i < typesCount; ++i)
            this.types.push({
                "entryClass": this.readString(),
                "entryType": this.readString(),
                "version": this.readU32V()
            });

        // Populate data offset list.
        stream.seek(tocOffset);
        var entryCount = this.readU32V();
        var dso = this.entryOffsets;
        for (var i = 0; i < entryCount; ++i)
            dso.push(stream.getUint32());

        // Restore sanity of the world.
        stream.seek(0);
    }
};

PackFileReader.prototype.readVarint = function() {
    var b;
    var value = 0;
    var shiftBy = 0;
    do {
        b = this.stream.getUint8();
        value |= (b & 0x7f) << shiftBy;
        shiftBy += 7;
    } while (b & 0x80);
    return value;
};
PackFileReader.prototype.readU32V = PackFileReader.prototype.readVarint;

PackFileReader.prototype.readU16 = function () {
    return this.stream.getUint16();
};

PackFileReader.prototype.readU8 = function () {
    return this.stream.getUint8();
};

PackFileReader.prototype.readString = function() {
    return this.stream.getString(this.readU32V());
};

PackFileReader.prototype.readVector3f = function () {
    var s = this.stream;
    return { x:s.getFloat32(), y:s.getFloat32(), z:s.getFloat32()};
};

PackFileReader.prototype.readVector3d = (function() {

    var t = { x:0, y:0, z:0 };

    return function () {
        var s = this.stream;
        t.x = s.getFloat64();
        t.y = s.getFloat64();
        t.z = s.getFloat64();

        return t;
    };
})();

PackFileReader.prototype.readQuaternionf = (function() {

    var q = { x:0, y:0, z:0, w:0 };

    return function() {
        var s = this.stream;
        q.x = s.getFloat32();
        q.y = s.getFloat32();
        q.z = s.getFloat32();
        q.w = s.getFloat32();

        return q;
    };

})();

PackFileReader.prototype.readMatrix3f = (function() {

    var _m = new LmvMatrix4();

    return function(dst) {
        if (!dst) dst = _m;
            
        var s = this.stream;
        dst.identity();
        for (var i = 0; i < 3; ++i)
            for (var j = 0; j < 3; ++j)
                dst.elements[4*i+j] = s.getFloat32();

        return dst;
    };

})();



PackFileReader.prototype.readTransform = (function() {

    var s = { x:1, y:1, z:1 };
    var m = new LmvMatrix4(true);

    return function(entityIndex, buffer, offset, placementTransform, globalOffset, originalTranslation)
    {
        var stream = this.stream;
        var t, q;

        var transformType = stream.getUint8();

        switch (transformType)
        {
            case 4/*TransformType.Identity*/: {
                m.identity();
            } break;
            case 0/*TransformType.Translation*/: {
                t = this.readVector3d();
                m.makeTranslation(t.x, t.y, t.z);
            } break;
            case 1/*TransformType.RotationTranslation*/: {
                q = this.readQuaternionf();
                t = this.readVector3d();
                s.x = 1;s.y = 1;s.z = 1;
                m.compose(t, q, s);
            } break;
            case 2/*TransformType.UniformScaleRotationTranslation*/: {
                var scale = stream.getFloat32();
                q = this.readQuaternionf();
                t = this.readVector3d();
                s.x = scale; s.y = scale; s.z = scale;
                m.compose(t, q, s);
            } break;
            case 3/*TransformType.AffineMatrix*/: {
                this.readMatrix3f(m);
                t = this.readVector3d();
                m.setPosition(t);
            } break;
            default:
                break; //ERROR
        }

        //Report the original translation term to the caller, if they need it.
        //This is only required when reading fragment bounding boxes, where the translation
        //term of this matrix is subtracted from the bbox terms.
        if (originalTranslation) {
            originalTranslation[0] = m.elements[12];
            originalTranslation[1] = m.elements[13];
            originalTranslation[2] = m.elements[14];
        }

        //Apply any placement transform
        if (placementTransform) {
            m.multiplyMatrices(placementTransform, m);
        }

        //Apply global double precision offset on top
        if (globalOffset) {
            m.elements[12] -= globalOffset.x;
            m.elements[13] -= globalOffset.y;
            m.elements[14] -= globalOffset.z;
        }

        //Store result back into single precision matrix or array
        if (entityIndex !== undefined) {
            var src = m.elements;
            // Sometimes we don't want to keep this data (e.g. when we are probing the fragment list
            // to find the data base id to fragment index mappings used for fragment filtering) so we
            // pass a null buffer and if that is the case, bail out here.
            if (!buffer) return;
            buffer[offset+0] = src[0]; buffer[offset+1] = src[1]; buffer[offset+2] = src[2];
            buffer[offset+3] = src[4]; buffer[offset+4] = src[5]; buffer[offset+5] = src[6];
            buffer[offset+6] = src[8]; buffer[offset+7] = src[9]; buffer[offset+8] = src[10];
            buffer[offset+9] = src[12]; buffer[offset+10] = src[13]; buffer[offset+11] = src[14];
        }
        else {
            return new LmvMatrix4().copy(m);
        }
    };

})();

PackFileReader.prototype.getEntryCounts = function() {
    return this.entryOffsets.length;
};

PackFileReader.prototype.seekToEntry = function(entryIndex) {
    var count = this.getEntryCounts();
    if (entryIndex >= count)
        return null;

    // Read the type index and populate the entry data
    this.stream.seek(this.entryOffsets[entryIndex]);
    var typeIndex = this.stream.getUint32();
    if (typeIndex >= this.types.length)
        return null;

    return this.types[typeIndex];
};


PackFileReader.prototype.readPathID = function() {
    var s = this.stream;

    //Construct a /-delimited string as the path to a node
    //TODO: in case we need a split representation (e.g. to follow paths), then
    //an array of numbers might be better to return from here.
    if (this.version < 2) {
        var pathLength = s.getUint16();
        if (!pathLength)
            return null;

        //The first number in a path ID is always zero (root)
        //so we skip adding it to the path string here.
        //Remove this section if that is not the case in the future.
        s.getUint16();
        if (pathLength == 1)
            return "";

        var path = s.getUint16();
        for (var i = 2; i < pathLength; ++i) {
            path += "/" + s.getUint16();
        }
    }
    else {
        var pathLength = this.readU32V();
        if (!pathLength)
            return null;

        //The first number in a path ID is always zero (root)
        //so we skip adding it to the path string here.
        //Remove this section if that is not the case in the future.
        this.readU32V();
        if (pathLength == 1)
            return "";

        var path = this.readU32V();
        for (var i = 2; i < pathLength; ++i) {
            path += "/" + this.readU32V();
        }
    }
    return path;
};

lmv.PackFileReader = PackFileReader;

})();

(function() {

"use strict";

var lmv = Autodesk.LMVTK;


//=====================================================================
//=====================================================================
//=====================================================================
//=====================================================================
//=====================================================================
//=====================================================================
//=====================================================================

var ntmp = new Float32Array(3);

var INV_PI = 1.0 / Math.PI;

//Faster approximation to atan2
//http://math.stackexchange.com/questions/1098487/atan2-faster-approximation
//The algorithm does not deal with special cases such as x=0,y=0x=0,y=0,
//nor does it consider special IEEE-754 floating-point operands such as infinities and NaN.
function atan2(y, x) {
    var ax = Math.abs(x);
    var ay = Math.abs(y);
    //var a = (ax > ay) ? ay / ax : ax / ay;
    var a = Math.min(ax, ay) / Math.max(ax, ay);
    var s = a * a;
    var r = ((-0.0464964749 * s + 0.15931422) * s - 0.327622764) * s * a + a;
    if (ay > ax)
        r = 1.57079637 - r;
    if (x < 0)
        r = 3.14159274 - r;
    if (y < 0)
        r = -r;
    return r;
}

function readOpenCTM_RAW(stream, mesh, dstBuffer, startOffset, estimateSizeOnly) {

    var readOpenCTMString = function() {
        return stream.getString(stream.getInt32());
    };

    //Now do the data reads
    var name = stream.getString(4);
    if (name != "INDX") return null;

    var vcount = mesh.vertexCount;
    var tcount = mesh.triangleCount;
    var stride = mesh.vbstride;

    //We will create a single ArrayBuffer to back both the vertex and index buffers
    //The indices will be places after the vertex information, because we need alignment
    //of 4 bytes
    var vbSizeFloat = vcount * stride;
    var totalSizeInFloats = vbSizeFloat + ((tcount*3*2 + 3) / 4)|0;

    mesh.sharedBufferBytes = totalSizeInFloats * 4;

    if (estimateSizeOnly) {
        return;
    }

    var vbf;
    if (!dstBuffer) {
        dstBuffer = new ArrayBuffer(totalSizeInFloats * 4);
        startOffset = 0;
    }

    vbf = mesh.vb = new Float32Array(dstBuffer, startOffset, vbSizeFloat);
    mesh.indices = new Uint16Array(dstBuffer, startOffset + vbSizeFloat*4, tcount*3);
    stream.getIndicesArray(vbf.buffer, startOffset + vbSizeFloat*4, tcount*3);

    name = stream.getString(4);
    if (name != "VERT") return null;

    var vbi;
    //See if we want to pack the normals into two shorts
    if (mesh.vblayout.normal && mesh.vblayout.normal.itemSize === 2)
        vbi = new Uint16Array(vbf.buffer, vbf.byteOffset, vbf.byteLength / 2);

    //Read positions
    stream.getVector3Array(vbf, vcount, mesh.vblayout['position'].offset, stride);

    //Read normals
    if (mesh.flags & 1) {
        name = stream.getString(4);
        if (name != "NORM") return null;

        if (vbi) {
            if (ntmp.length < vcount*3)
                ntmp = new Float32Array(vcount*3);
            stream.getVector3Array(ntmp, vcount, 0, 3);

            for (var i=0, offset=mesh.vblayout['normal'].offset;
                 i<vcount;
                 i++, offset += stride)
            {
                var pnx = (atan2(ntmp[i*3+1], ntmp[i*3]) * INV_PI + 1.0) * 0.5;
                var pny = (ntmp[i*3+2] + 1.0) * 0.5;

                vbi[offset*2] = (pnx * 65535)|0;
                vbi[offset*2+1] = (pny * 65535)|0;
            }
        } else {
            stream.getVector3Array(vbf, vcount, mesh.vblayout['normal'].offset, stride);
        }

    }

    //Read uv layers
    for (var t=0; t<mesh.texMapCount; t++) {
        name = stream.getString(4);
        if (name != "TEXC") return null;

        var uv = {
            name : readOpenCTMString(),
            file : readOpenCTMString()
        };
        mesh.uvs.push(uv);

        var uvname = "uv";
        if (t)
            uvname += (t+1).toString();

        stream.getVector2Array(vbf, vcount, mesh.vblayout[uvname].offset, stride);
    }

    var attributeOffset = stride - (mesh.attribMapCount||0) * 3;

    //Read vertex colors and uvw (and skip any other attributes that we don't know)
    for (var t=0; t<mesh.attribMapCount; t++) {
        name = stream.getString(4);
        if (name != "ATTR") return null;

        var attr = {
            name : readOpenCTMString()
        };

        // console.log("attribute", attr.name);

        var attrname;
        if (attr.name.indexOf("Color") != -1)//Special case of vertex colors
            attrname = 'color';
        else if (attr.name.indexOf("UVW") != -1)//Only used by prism 3d wood.
            attrname = 'uvw';
        else {
            //Other attributes, though we don't know what to do with those
            mesh.attrs.push(attr);
            stream.getBytes(vcount*16); //skip past
            continue;
        }

        mesh.vblayout[attrname] = { offset : attributeOffset, itemSize : 3};

        var v4 = [0,0,0,0];
        for (var i=0, offset=attributeOffset;
                i<vcount;
                i++, offset += stride) {
            stream.getVector4(v4,0);
            vbf[offset] = v4[0];
            vbf[offset+1] = v4[1];
            vbf[offset+2] = v4[2];
            //Ignoring the alpha term. For color attribute, we can actually pack it in a 4-byte attribute,
            //but we do not know in advance (when we allocate the target buffer) if the OCTM attribute is UVW or color
        }
        attributeOffset += 3;
    }

}


//=====================================================================
//=====================================================================
//=====================================================================
//=====================================================================
//=====================================================================
//=====================================================================
//=====================================================================


var readOpenCTM = function(stream, dstBuffer, startOffset, estimateSizeOnly) {

    var readOpenCTMString = function() {
        return stream.getString(stream.getInt32());
    };

    var fourcc = stream.getString(4);
    if (fourcc != "OCTM") return null;

    var version = stream.getInt32();
    if (version != 5) return null;

    var method = stream.getString(3);
    stream.getUint8(); //read the last 0 char of the RAW or MG2 fourCC.

    var mesh = {
        stream: null,
        vertices:   null,
        indices:    null,
        normals:    null,
        colors:     null,
        uvs:        [],
        attrs:      []
    };

    mesh.vertexCount = stream.getInt32();
    mesh.triangleCount = stream.getInt32();
    mesh.texMapCount = stream.getInt32();
    mesh.attribMapCount = stream.getInt32();
    mesh.flags = stream.getInt32();
    mesh.comment = readOpenCTMString();

    var usePackedNormals = true;


    //Calculate stride of the interleaved buffer we need
    mesh.vbstride = 3; //position is always there
    if (mesh.flags & 1)
        mesh.vbstride += usePackedNormals ? 1 : 3; //normal
    mesh.vbstride += 2 * (mesh.texMapCount || 0); //texture coords
    mesh.vbstride += 3 * (mesh.attribMapCount || 0); //we now support color and uvw. Both of them use three floats.

    mesh.vblayout = {};
    var offset = 0;

    mesh.vblayout['position'] = { offset: offset, itemSize: 3 };

    offset += 3;
    if (mesh.flags & 1) {
        mesh.vblayout['normal'] = { offset : offset, 
                                    itemSize : usePackedNormals ? 2 : 3, 
                                    bytesPerItem: usePackedNormals ? 2 : 4,
                                    normalize: usePackedNormals };

        offset += usePackedNormals ? 1 : 3; //offset is counted in units of 4 bytes
    }
    if (mesh.texMapCount) {
        for (var i=0; i<mesh.texMapCount; i++) {
            var uvname = "uv";
            if (i)
                uvname += (i+1).toString();

            mesh.vblayout[uvname] = { offset : offset, itemSize: 2 };
            offset += 2;
        }
    }

    //Now read and populate the mesh data
    if (method == "RAW") {
        readOpenCTM_RAW(stream, mesh, dstBuffer, startOffset, estimateSizeOnly);
        if (!estimateSizeOnly) {
            lmv.VBUtils.deduceUVRepetition(mesh);
            lmv.VBUtils.computeBounds3D(mesh);
        }
        return mesh;
    }
    else if (method == "MG2") {
        //This code path is never used, since MG2 compression is disabled at the LMVTK C++ level
        readOpenCTM_MG2(stream, mesh, dstBuffer, startOffset, estimateSizeOnly);
        if (!estimateSizeOnly) {
            lmv.VBUtils.deduceUVRepetition(mesh);
            lmv.VBUtils.computeBounds3D(mesh);
        }
        return mesh;
    }
    else
        return null;
};


var readLines = function(pfr, tse, estimateSizeOnly) {

    //TODO: Line geometry does not go into shared buffers yet
    if (estimateSizeOnly)
        return null;

    // Initialize mesh
    var mesh = {
        isLines:    true,
        vertices:   null,
        indices:    null,
        colors:     null,
        normals:    null,
        uvs:        [],
        attrs:      []
    };

    // Read vertex count, index count, polyline bound count
    var indexCount;
    var polyLineBoundCount;
    if ( tse.version > 1 ) {
        mesh.vertexCount   = pfr.readU16();
        indexCount         = pfr.readU16();
        polyLineBoundCount = pfr.readU16();
    }
    else {
        mesh.vertexCount   = pfr.readU32V();
        indexCount         = pfr.readU32V();
        polyLineBoundCount = pfr.readU32V();
    }

    // Determine if color is defined
    var  hasColor = (pfr.stream.getUint8() != 0);


    //Calculate stride of the interleaved buffer we need
    mesh.vbstride = 3; //position is always there
    if (hasColor)
        mesh.vbstride += 3; //we only interleave the color attribute, and we reduce that to RGB from ARGB.

    mesh.vblayout = {};
    var offset = 0;

    mesh.vblayout['position'] = { offset: offset, itemSize: 3 };

    offset += 3;
    if (hasColor) {
        mesh.vblayout['color'] = { offset : offset, itemSize : 3};
    }

    mesh.vb = new Float32Array(mesh.vertexCount * mesh.vbstride);


    // Read vertices
    var vbf = mesh.vb;
    var stride = mesh.vbstride;
    var stream = pfr.stream;

    stream.getVector3Array(vbf, mesh.vertexCount, mesh.vblayout['position'].offset, stride);

    // Determine color if specified
    if (hasColor) {
        for (var c=0, offset=mesh.vblayout['color'].offset, cEnd=mesh.vertexCount;
             c<cEnd;
             c++, offset += stride)
        {
            vbf[offset] = stream.getFloat32();
            vbf[offset+1] = stream.getFloat32();
            vbf[offset+2] = stream.getFloat32();
            stream.getFloat32(); //skip alpha -- TODO: convert color to ARGB 32 bit integer in the vertex layout and shader
        }
    }

    // Copies bytes from buffer
    var forceCopy = function(b) {
        return b.buffer.slice(b.byteOffset, b.byteOffset + b.length);
    };

    // Read indices and polyline bound buffer
    var indices;
    var polyLineBoundBuffer;
    if ( tse.version > 1 ) {
        // 16 bit format
        indices = new Uint16Array(forceCopy(stream.getBytes(indexCount*2)));
        polyLineBoundBuffer = new Uint16Array(forceCopy(stream.getBytes(polyLineBoundCount*2)));
    }
    else {
        // 32 bit format
        indices = new Int32Array(forceCopy(stream.getBytes(indexCount*4)));
        polyLineBoundBuffer = new Int32Array(forceCopy(stream.getBytes(polyLineBoundCount*4)));
    }

    // three.js uses GL-style index pairs in its index buffer. We need one pair
    // per segment in each polyline
    var indexPairs = polyLineBoundBuffer[polyLineBoundCount-1] - polyLineBoundCount + 1;

    mesh.indices = new Uint16Array(2*indexPairs);

    // Extract the individual line segment index pairs
    var meshIndex = 0;
    for (var i=0; i+1 < polyLineBoundCount; i++){
        for(var j = polyLineBoundBuffer[i]; j+1 < polyLineBoundBuffer[i+1]; j++){
            mesh.indices[meshIndex++] = indices[j];
            mesh.indices[meshIndex++] = indices[j+1];
        }
    }

    lmv.VBUtils.computeBounds3D(mesh);

    return mesh;
};



function readGeometry(pfr, entry, format, dstBuffer, startOffset, estimateSizeOnly) {
    var tse = pfr.seekToEntry(entry);
    if (!tse)
        return null;

    if (tse.entryType == "Autodesk.CloudPlatform.OpenCTM") {
        return readOpenCTM(pfr.stream, dstBuffer, startOffset, estimateSizeOnly);
    }
    else if (tse.entryType == "Autodesk.CloudPlatform.Lines") {
        return readLines(pfr, tse, estimateSizeOnly);
    }

    return null;
}

lmv.readGeometry = readGeometry;

})();

(function() {

"use strict";

var lmv = Autodesk.LMVTK;


function readLightDefinition(pfr, entry) {
    var tse = pfr.seekToEntry(entry);
    if (!tse)
        return null;
    if (tse.version > 1 /*Constants::LightDefinitionVersion*/)
        return null;

    var s = pfr.stream;

    var light = {
        position:   pfr.readVector3f(),
        dir:        pfr.readVector3f(),
        r:          s.getFloat32(),
        g:          s.getFloat32(),
        b:          s.getFloat32(),
        intensity:  s.getFloat32(),
        spotAngle:  s.getFloat32(),
        size:       s.getFloat32(),
        type:       s.getUint8()
    };

    return light;
}

lmv.readLightDefinition = readLightDefinition;

})();
(function() {

"use strict";

var lmv = Autodesk.LMVTK;


function readCameraDefinition(pfr, inst) {
    var entry = inst.definition;
    var tse = pfr.seekToEntry(entry);
    if (!tse)
        return null;
    if (tse.version > 2 /*Constants::CameraDefinitionVersion*/)
        return null;

    var s = pfr.stream;
    var cam = {
        isPerspective : !s.getUint8(), /* 0 = perspective, 1 = ortho */
        position : pfr.readVector3f(),
        target: pfr.readVector3f(),
        up: pfr.readVector3f(),
        aspect: s.getFloat32(),
        fov: s.getFloat32()*(180/Math.PI)
    };
    if (tse.version < 2) {
        // Skip the clip planes for old files.
        s.getFloat32();
        s.getFloat32();
    }

    cam.orthoScale = s.getFloat32();

    return cam;
}

lmv.readCameraDefinition = readCameraDefinition;

})();

(function() {

"use strict";

var lmv = Autodesk.LMVTK;
var av = Autodesk.Viewing,
    avp = av.Private;

//FragList represents an array of fragments, stored in Structure of Arrays form
//which allows us to free some parts easily and transfer the fragment information in large chunks.
var NUM_FRAGMENT_LIMITS = (av.isMobileDevice()) ? null : null;

/** @constructor */
function FragList() {
    this.length = 0;
    this.numLoaded = 0;

    this.boxes = null;
    this.transforms = null;
    this.materials = null;

    this.packIds = null;
    this.entityIndexes = null;

    this.fragId2dbId = null;
    this.mesh2frag = null;

    this.topoIndexes = null;
}

function readGeometryMetadataIntoFragments(pfr, fragments) {
    var length = fragments.geomDataIndexes.length;
    var stream = pfr.stream;
    var primsCount = 0;

    // Read from cache if the same entry has been reading from stream.
    var entryCache = {};
    fragments.polygonCounts = fragments.geomDataIndexes;
    for (var g = 0; g < length; g++) {
        var entry = fragments.geomDataIndexes[g];

        if (entryCache[entry]) {
            var i = entryCache[entry];
            fragments.polygonCounts[g] = fragments.polygonCounts[i];
            fragments.packIds[g] = fragments.packIds[i];
            fragments.entityIndexes[g] = fragments.entityIndexes[i];
            primsCount += fragments.polygonCounts[g];
        }
        else {
            var tse = pfr.seekToEntry(entry);
            if (!tse)
                return;

            // Frag type, seems no use any more.
            stream.getUint8();
            //skip past object space bbox -- we don't use that
            stream.seek(stream.offset + 24);

            fragments.polygonCounts[g] = stream.getUint16();
            fragments.packIds[g] = parseInt(pfr.readString());
            fragments.entityIndexes[g] = pfr.readU32V();
            primsCount += fragments.polygonCounts[g];

            entryCache[entry] = g;
        }
    }
    fragments.geomDataIndexes = null;
    entryCache = null;

    return primsCount;
}

function readGeometryMetadata(pfr, geoms)
{
    var numGeoms = pfr.getEntryCounts();
    var stream = pfr.stream;

    geoms.length = numGeoms;
    var fragTypes = geoms.fragTypes = new Uint8Array(numGeoms);
    var primCounts = geoms.primCounts = new Uint16Array(numGeoms);
    var packIds = geoms.packIds = new Int32Array(numGeoms);
    var entityIndexes = geoms.entityIndexes = new Int32Array(numGeoms);
    // Holds the indexes to the topology data.
    var topoIndexes;

    for (var g = 0, gEnd = numGeoms; g<gEnd; g++) {
        var tse = pfr.seekToEntry(g);
        if (!tse)
            return;

        fragTypes[g] = stream.getUint8();
        //skip past object space bbox -- we don't use that
        stream.seek(stream.offset + 24);
        primCounts[g] = stream.getUint16();
        packIds[g] = parseInt(pfr.readString());
        entityIndexes[g] = pfr.readU32V();

        if (tse.version > 2) {
            var topoIndex = stream.getInt32();
            if (topoIndex != -1 && topoIndexes === undefined) {
                 topoIndexes = geoms.topoIndexes = new Int32Array(numGeoms);
                 // Fill in the first entries to indicate
                 for(var i = 0; i < g; i++)
                     topoIndexes[i] = -1;
            }

            if (topoIndexes != undefined)
                 topoIndexes[g] = topoIndex;
        }

    }
}

// Convert a list of object id (dbid) to a list of integers where each integer is an index of the fragment
// in fragment list that associated with the object id.
function objectIds2FragmentIndices(pfr, ids) {
    var ret = [];

    if (!ids) {
        return ret;
    }

    var counts = pfr.getEntryCounts();
    var stream = pfr.stream;
    for (var entry = 0; entry < counts; entry++) {
        var tse = pfr.seekToEntry(entry);
        if (!tse)
            return;
        if (tse.version > 5)
            return;

        // Keep reading fragment fields as usual, but does not store anything as we only
        // interested in the data base id / object id field at the very end.
        if ( tse.version > 4 ) {
            // Flag byte.
            pfr.readU8();
        }
        // Material index
        pfr.readU32V();
        if (tse.version > 2) {
            // Geometry metadata reference
            pfr.readU32V();
        } else {
            // Pack file reference
            pfr.readString();
            pfr.readU32V();
        }

        // Transform
        pfr.readTransform(entry, null, 12 * entry);

        // Bounding box
        for (var i = 0; i < 6; i++) {
            stream.getFloat32();
        }

        if (tse.version > 1) {
            var dbid = pfr.readU32V();
            if (ids.indexOf(dbid) >= 0) {
                ret.push(entry);
            }
        }
    }

    return ret;
}


function readFragments(pfr, frags, globalOffset, placementTransform, ids) {
    var filteredIndices = objectIds2FragmentIndices(pfr, ids);

    //Initialize all the fragments structures
    //once we know how many fragments we have.
    var numFrags = filteredIndices.length ? filteredIndices.length : pfr.getEntryCounts();
    var stream = pfr.stream;

    if (NUM_FRAGMENT_LIMITS && numFrags > NUM_FRAGMENT_LIMITS) {
        numFrags = NUM_FRAGMENT_LIMITS;
    }

    frags.length = numFrags;
    frags.numLoaded = 0;

    //Allocate flat array per fragment property
    var fragBoxes       = frags.boxes =                 new Float32Array(6*numFrags);
    var transforms      = frags.transforms =            new Float32Array(12*numFrags);
    var materials       = frags.materials =             new Int32Array(numFrags);
    var packIds         = frags.packIds =               new Int32Array(numFrags);
    var entityIndexes   = frags.entityIndexes =         new Int32Array(numFrags);
    var geomDataIndexes = frags.geomDataIndexes =       new Int32Array(numFrags);
    var fragId2dbId     = frags.fragId2dbId =           new Int32Array(numFrags); //NOTE: this potentially truncates IDs bigger than 4 billion -- can be converted to array if needed.

    var tmpBox;
    var tmpMat;
    var boxTranslation = [0,0,0];
    if (placementTransform) {
        tmpBox = new LmvBox3();
        tmpMat = new LmvMatrix4(true).fromArray(placementTransform.elements);
    }

    //Helper functions used by the main fragment read loop.

    function applyPlacement(index) {
        if (placementTransform) {
            var offset = index * 6;
            tmpBox.setFromArray(fragBoxes, offset);
            tmpBox.applyMatrix4(tmpMat);
            tmpBox.copyToArray(fragBoxes, offset);
        }
    }

    function readBoundingBox(entry) {
        var offset = entry * 6;
        for (var i=0; i<6; i++)
            fragBoxes[offset++] = stream.getFloat32();
    }

    function readBoundingBoxOffset(entry, boxTranslation) {
        var offset = entry * 6;
        for (var i=0; i<6; i++)
            fragBoxes[offset++] = stream.getFloat32() + boxTranslation[i % 3];
    }

    //Spin through all the fragments now
    for (var entry=0, eEnd=frags.length; entry<eEnd; entry++) {
        var tse = filteredIndices.length ? pfr.seekToEntry(filteredIndices[entry]) : pfr.seekToEntry(entry);

        if (!tse)
            return;
        if (tse.version > 5)
            return;

        var isVisible = true;
        if ( tse.version > 4 ) {
            // Fragments v5+ include a flag byte, the LSB of which denotes
            // visibility
            var flags = pfr.readU8();
            isVisible = (flags & 0x01) != 0;
        }

        materials[entry] = pfr.readU32V();

        if (tse.version > 2) {
            //In case it's new style fragment that
            //points to a geometry metadata entry
            geomDataIndexes[entry] = pfr.readU32V();
        }
        else {
            //Old style fragment, pack reference is directly
            //encoded in the fragment entry
            packIds[entry] = parseInt(pfr.readString());
            entityIndexes[entry] = pfr.readU32V();
        }

        pfr.readTransform(entry, transforms, 12*entry, placementTransform, globalOffset, boxTranslation);

        if (tse.version > 3) {
            // With this version the transform's (double precision) translation is subtracted from the BB,
            // so we have to add it back
            readBoundingBoxOffset(entry, boxTranslation);
        }
        else {
            readBoundingBox(entry);
        }

        //Apply the placement transform to the world space bbox
        applyPlacement(entry);

        //Apply any global offset to the world space bbox
        if (globalOffset) {
            var offset = entry * 6;
            fragBoxes[offset++] -= globalOffset.x;
            fragBoxes[offset++] -= globalOffset.y;
            fragBoxes[offset++] -= globalOffset.z;
            fragBoxes[offset++] -= globalOffset.x;
            fragBoxes[offset++] -= globalOffset.y;
            fragBoxes[offset++] -= globalOffset.z;
        }

        if (tse.version > 1) {
            fragId2dbId[entry] = pfr.readU32V();
        }
        // Skip reading path ID which is not in use now.
        // pfr.readPathID();
    }

    frags.finishLoading = true;
}

// Filter fragments based on specified object id list, by picking
// up fragment whose id is in the specified id list, and dropping others.
// This is used to produce a list of fragments that matches a search hit.
function filterFragments(frags, ids) {
    frags.length = ids.length;
    frags.numLoaded = 0;
    var numFrags = frags.length;
    var bb = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];

    var fragBoxes       = new Float32Array(6 * numFrags);
    var transforms      = new Float32Array(12 * numFrags);
    var materials       = new Int32Array(numFrags);
    var packIds         = new Int32Array(numFrags);
    var entityIndexes   = new Int32Array(numFrags);
    var mesh2frag = {};

    for (var i = 0; i < ids.length; ++i) {
        var index = ids[i];

        var idxOld = index * 6;
        var idxNew = i * 6;
        for (var j = 0; j < 6; ++j)
            fragBoxes[idxNew++] = frags.boxes[idxOld++];

        idxOld = index * 12;
        idxNew = i * 12;
        for (var j = 0; j < 12; ++j)
            transforms[idxNew++] = frags.transforms[idxOld++];

        materials[i] = frags.materials[index];
        packIds[i] = frags.packIds[index];
        entityIndexes[i] = frags.entityIndexes[index];

        // TODO: consolidate this with addToMeshMap.
        var meshID = frags.packIds[index] + ":" + frags.entityIndexes[index];
        var meshRefs = mesh2frag[meshID];
        if (meshRefs == undefined) {
            mesh2frag[meshID] = i;
        }
        else if (!Array.isArray(meshRefs)) {
            mesh2frag[meshID] = [meshRefs, i];
        }
        else {
            meshRefs.push(i);
        }

        var bbIndex = i * 6;
        for (var j = 0; j < 3; ++j)
            if (fragBoxes[bbIndex + j] < bb[j])
                bb[j] = fragBoxes[bbIndex + j];
        for (var j = 3; j < 6; ++j)
            if (fragBoxes[bbIndex + j] > bb[j])
                bb[j] = fragBoxes[bbIndex + j];
    }

    frags.boxes = fragBoxes;
    frags.transforms = transforms;
    frags.materials = materials;
    frags.packIds = packIds;
    frags.entityIndexes = entityIndexes;
    frags.mesh2frag = mesh2frag;

    return bb;
}

lmv.FragList = FragList;
lmv.readGeometryMetadataIntoFragments = readGeometryMetadataIntoFragments;
lmv.readGeometryMetadata = readGeometryMetadata;
lmv.filterFragments = filterFragments;
lmv.readFragments = readFragments;

})();

(function() {

"use strict";

var lmv = Autodesk.LMVTK;


function readInstance(pfr, entry, placementTransform, globalOffset) {
    var tse = pfr.seekToEntry(entry);
    if (!tse)
        return null;
    if (tse.version > 2 /*Constants::InstanceVersion*/)
        return null;

    var isVisible = true;
    if ( tse.version > 1 ) {
        // Instances v2+ include a flag byte, the LSB of which denotes visibility
        var flags = pfr.readU8();
        isVisible = (flags & 0x01) != 0;
    }

    return {
        definition: pfr.stream.getUint32(),
        transform: pfr.readTransform(undefined, undefined, undefined, placementTransform, globalOffset),
        instanceNodePath: pfr.readPathID()
    }
}

lmv.readInstance = readInstance;

})();
(function() {
    'use strict';

var av = Autodesk.Viewing,
    lmv = Autodesk.LMVTK,
    avp = av.Private;

// Threshold to enable loading/handling fragments and geometry metadata in a memory optimized way.
// 6 Mb for weak device, 32 Mb for others. And the size is the compressed size.
// currently not used: 
//var MAX_FRAGMENT_PACK_SIZE = (av.isMobileDevice()) ? (6 * 1024 * 1024) : (32 * 1024 *1024);
var MAX_PF_FILES = av.isMobileDevice() ? 50 : 2000;

/** @constructor */
function Package(zipPack) {

    this.unzip = new Zlib.Unzip(zipPack);

    this.manifest = null;

    this.materials = null; //The materials json as it came from the SVF

    this.metadata = null; //metadata json

    this.fragments = null; //will be a FragList

    this.geompacks = [];

    //TODO:
    //Those will not be parsed immediately
    //but we will remember the raw arrays
    //and fire off async workers to parse
    //them later, once we are loading geometry packs
    this.instances = [];

    this.cameras = [];
    this.lights = [];

    this.propertydb = {
        attrs : [],
        avs: [],
        ids: [],
        values: [],
        offsets: []
    };

    this.bbox = null; //Overall scene bounds

    this.animations = null; // animations json

    this.pendingRequests = 0;

    this.globalOffset = { x: 0, y: 0, z: 0 };

    this.topology = null; // Topology json

    this.memoryOptimizedMode = false;
}



Package.prototype.loadAsyncResource = function(loadContext, resourcePath, contents, callback) {

    //Data is immediately available from the SVF zip
    if (contents) {
        callback(contents);
        return;
    }

    //Launch an XHR to load the data from external file
    var svf = this;

    this.pendingRequests ++;

    function xhrCB(responseData) {
        svf.pendingRequests--;

        callback(responseData);

        if (svf.pendingRequests == 0)
            svf.postLoad(loadContext);
    }

    avp.ViewingService.getItem(loadContext, loadContext.basePath + resourcePath,
                            xhrCB,
                            loadContext.onFailureCallback,
                            { asynchronous:true }
                           );

};

Package.prototype.loadManifest = function(loadContext) {
    // TODO: zlib.js throws exceptions on failure;
    // it doesn't return null as this code seems to assume.
    // yes, LoadContext is passed in, but is not used.
    var manifestJson = this.unzip.decompress("manifest.json");
    if (!manifestJson)
        return false;

    var jdr = new lmv.InputStream(manifestJson);
    this.manifest = JSON.parse(jdr.getString(manifestJson.byteLength));
};

Package.prototype.loadRemainingSvf = function(loadContext) {
    var svf = this;

    var unzip = this.unzip;

    //var filenames = unzip.getFilenames();
    this.manifest = loadContext.manifest;
    var manifest = this.manifest;

    var assets = manifest["assets"];

    var metadataJson = unzip.decompress("metadata.json");
    var jdr = new lmv.InputStream(metadataJson);

    // Test to see if this is json (not a binary header)
    // Done by verifying that there is no 0 (Hence ASCII)
    if(metadataJson.byteLength > 3 && metadataJson[3] !== 0) {
        this.metadata = JSON.parse(jdr.getString(metadataJson.byteLength)).metadata;

        //Retrieve world bounding box
        if ( this.metadata ) {
            var bbox = this.metadata["world bounding box"];
            var min = { x: bbox.minXYZ[0], y: bbox.minXYZ[1], z: bbox.minXYZ[2] };
            var max = { x: bbox.maxXYZ[0], y: bbox.maxXYZ[1], z: bbox.maxXYZ[2] };
            this.bbox ={min:min, max:max };

            //Global offset is used to avoid floating point precision issues for models
            //located enormous distances from the origin. The default is to move the model to the origin
            //but it can be overridden in case of model aggregation scenarios, where multiple
            //models are loaded into the scene and a common offset is needed for all.
            this.globalOffset = loadContext.globalOffset ||  { x: 0.5 * (min.x + max.x), y: 0.5 * (min.y + max.y), z: 0.5 * (min.z + max.z) };


            //First, take the input placement transform as is (could be null).
            this.placementTransform = loadContext.placementTransform;

            //Is there an extra offset specified in the georeference?
            //This is important when aggregating Revit models from the same Revit
            //project into the same scene, because Revit SVFs use RVT internal coordinates, which
            //need extra offset to get into the world space.
            var georeference = this.metadata["georeference"];
            if (georeference) {
                var refPointLMV = georeference["refPointLMV"];
                if (refPointLMV) {

                    //Here we convert the reference point and rotation angles
                    //to a simple 4x4 transform for easier use and application later.
    
                    var angle = 0;
                    var cv = this.metadata["custom values"];
                    if (cv && cv.hasOwnProperty("angleToTrueNorth")) {
                        angle = (Math.PI / 180.0) * cv["angleToTrueNorth"];
                    }
    
                    var refPoint = new LmvMatrix4(true);
                    var m = refPoint.elements;
    
                    m[0] = m[5] = Math.cos(angle);
                    m[1] = -Math.sin(angle);
                    m[4] = Math.sin(angle);
    
                    m[12] = refPointLMV[0];
                    m[13] = refPointLMV[1];
                    m[14] = refPointLMV[2];
    
                    this.refPointTransform = refPoint;
                }
            }

            //If request in the load options, apply the reference point transform when loading the model
            if (loadContext.applyRefPoint && this.refPointTransform) {

                var placement = new LmvMatrix4(true);

                //Normally we expect the input placement transform to come in as identity in case
                //we have it specified in the georef here, but, whatever, let's be thorough for once.
                if (loadContext.placementTransform)
                    placement.copy(loadContext.placementTransform);

                placement.multiply(this.refPointTransform);

                this.placementTransform = loadContext.placementTransform = placement;
            }

            min.x -= this.globalOffset.x;
            min.y -= this.globalOffset.y;
            min.z -= this.globalOffset.z;
            max.x -= this.globalOffset.x;
            max.y -= this.globalOffset.y;
            max.z -= this.globalOffset.z;

            if (this.metadata.hasOwnProperty("double sided geometry")
                && this.metadata["double sided geometry"]["value"]) //TODO: do we want to check the global flag or drop that and rely on material only?
            {
                this.doubleSided = true;
            }
        }
    }

    //Version strings seem to be variable at the moment.
    //var manifestVersion = manifest["manifestversion"];
    //if (   manifest["name"] != "LMV Manifest"
    //    || manifest["manifestversion"] != 1)
    //    return false;

    this.packFileTotalSize = 0;
    this.primitiveCount = 0;

    var typesetsList = manifest["typesets"];
    var typesets = {};
    for (var i=0; i<typesetsList.length; i++) {
        var ts = typesetsList[i];
        typesets[ts['id']] = ts['types'];
    }

    var pendingGeometryMetadataLoad = {};

    //Loop through the assets, and schedule non-embedded
    //ones for later loading.
    //TODO: currently only geometry pack files are stored for later
    //load and other assets will be loaded by this worker thread before
    //we return to the SvfLoader in the main thread.
    function applyOffset(a, offset) {
        a[0] -= offset.x;
        a[1] -= offset.y;
        a[2] -= offset.z;
    }
    
    for (var i=0; i<assets.length; i++)
    {
        var asset = assets[i];
        if (av.isMobileDevice() && ((asset.id === "Set.bin") || (asset.id === "Topology.json.gz"))) continue;
        var type = asset["type"];
        if (type.indexOf("Autodesk.CloudPlatform.") == 0)
            type = type.substr(23);
        var uri = asset["URI"];
        var typeset = asset["typeset"] ? typesets[asset["typeset"]] : null;

        //If the asset is a geometry pack or property pack
        //just remember it for later demand loading
        if (uri.indexOf("embed:/") != 0) {
            if (type == "PackFile") {
                var typeclass = typeset ? typeset[0]["class"] : null;

                if (typeclass == "Autodesk.CloudPlatform.Geometry") {

                    this.packFileTotalSize += asset["usize"] || 0;

                    if (this.geompacks.length < MAX_PF_FILES)
                        this.geompacks.push({ id: asset["id"], uri: uri });
                }
            }
            else if (type == "PropertyAttributes") {
                this.propertydb.attrs.push(uri);
            }
            else if (type == "PropertyAVs") {
                this.propertydb.avs.push(uri);
            }
            else if (type == "PropertyIDs") {
                this.propertydb.ids.push(uri);
            }
            else if (type == "PropertyOffsets") {
                this.propertydb.offsets.push(uri);
            }
            else if (type == "PropertyValues") {
                this.propertydb.values.push(uri);
            }
        }

        //parse assets which we will need immediately when
        // setting up the scene (whether embedded or not)
        var path = asset["URI"];
        var contents = null; //if the data was in the zip, this will contain it
        if (path.indexOf("embed:/") == 0) {
            path = path.substr(7);
            contents = unzip.decompress(path);
        }

        if (type == "ProteinMaterials") {
            //For simple materials, we want the file named "Materials.json" and not "ProteinMaterials.json"
            if (path.indexOf("Protein") == -1) {
                this.loadAsyncResource(loadContext, path, contents, function(data) {
                    var jdr = new lmv.InputStream(data);
                    var byteLength = data.byteLength;
                    if (0 < byteLength) {
                        svf.materials = JSON.parse(jdr.getString(byteLength));
                    } else {
                        svf.materials = null;
                    }
                });
            } else {
                //Also parse the Protein materials -- at the moment this helps
                //With some Prism materials that have properties we can handle, but
                //are not in the Simple variant.
                this.loadAsyncResource(loadContext, path, contents, function(data) {
                    var jdr = new lmv.InputStream(data);
                    var byteLength = data.byteLength;
                    if (0 < byteLength) {
                        svf.proteinMaterials = JSON.parse(jdr.getString(byteLength));
                    } else {
                        svf.proteinMaterials = null;
                    }
                });
            }
        }
        else if (type == "FragmentList") {
            this.memoryOptimizedMode = false;

            var self = this;
            this.loadAsyncResource(loadContext, path, contents, function(data) {
                var pfr = new lmv.PackFileReader(data);

                //Use a single large blocks to store all fragment elements
                //TODO: perhaps have a FragList per pack file to keep block size down?
                var frags = svf.fragments = new lmv.FragList();
                lmv.readFragments(pfr, frags, svf.globalOffset, loadContext.placementTransform, loadContext.objectIds);
                pfr = null;

                // If there are any pending geometry metadata loading (as a result of enabled optimization
                // code path to read geometry metadata directly into fragments instead of read separately then
                // combine with fragments), load them and process them.
                if (self.memoryOptimizedMode && pendingGeometryMetadataLoad.path) {
                    svf.loadAsyncResource(loadContext, pendingGeometryMetadataLoad.path, pendingGeometryMetadataLoad.contents, function(data) {
                    pfr = new lmv.PackFileReader(data);
                    svf.primitiveCount = lmv.readGeometryMetadataIntoFragments(pfr, svf.fragments);
                        pfr = null;
                        pendingGeometryMetadataLoad.contents = null;
                    });
                }
            });

        }
        else if (type == "GeometryMetadataList") {
            var self = this;
            this.loadAsyncResource(loadContext, path, contents, function(data) {
                var pfr = new lmv.PackFileReader(data);

                svf.geomMetadata = {};

                if (self.memoryOptimizedMode) {
                    if (svf.fragments && svf.fragments.finishLoading) {
                        svf.primitiveCount = lmv.readGeometryMetadataIntoFragments(pfr, svf.fragments);
                    } else {
                        pendingGeometryMetadataLoad.path = path;
                        pendingGeometryMetadataLoad.contents = contents;
                        contents = null;
                    }
                } else {
                    lmv.readGeometryMetadata(pfr, svf.geomMetadata);
                }
            });
        }
        else if (type == "PackFile") {

            if (path.indexOf("CameraDefinitions.bin") != -1) {
                this.loadAsyncResource(loadContext, path, contents, function(data) {
                    svf.camDefPack = new lmv.PackFileReader(data);
                });
            }

            else if (path.indexOf("CameraList.bin") != -1) {
                this.loadAsyncResource(loadContext, path, contents, function(data) {
                    svf.camInstPack = new lmv.PackFileReader(data);
                });
            }

            else if (path.indexOf("LightDefinitions.bin") != -1) {
                this.loadAsyncResource(loadContext, path, contents, function(data) {
                    svf.lightDefPack = new lmv.PackFileReader(data);
                });
            }

            else if (path.indexOf("LightList.bin") != -1) {
                this.loadAsyncResource(loadContext, path, contents, function(data) {
                    svf.lightInstPack = new lmv.PackFileReader(data);
                });
            }
        }
        else if (type == "Animations") {
            this.loadAsyncResource(loadContext, path, contents, function(data) {
                var jdr = new lmv.InputStream(data);
                var byteLength = data.byteLength;
                if (0 < byteLength) {
                    svf.animations = JSON.parse(jdr.getString(byteLength));

                    // apply global offset to animations
                    var animations = svf.animations["animations"];
                    if (animations) {
                        var globalOffset = svf.globalOffset;
                        var t = new LmvMatrix4().makeTranslation(globalOffset.x, globalOffset.y, globalOffset.z);
                        var tinv = new LmvMatrix4().makeTranslation(-globalOffset.x, -globalOffset.y, -globalOffset.z);
                        var r = new LmvMatrix4();
                        var m = new LmvMatrix4();
                        for (var a = 0; a < animations.length; a++) {
                            var anim = animations[a];
                            if (anim.hierarchy) {
                                for (var h = 0; h < anim.hierarchy.length; h++) {
                                    var keys = anim.hierarchy[h].keys;
                                    if (keys) {
                                        for (var k = 0; k < keys.length; k++) {
                                            var pos = keys[k].pos;
                                            if (pos) {
                                                var offset = globalOffset;
                                                var rot = keys[k].rot;
                                                if (rot) {
                                                    r.makeRotationFromQuaternion({x:rot[0], y:rot[1], z:rot[2], w:rot[3]});
                                                    m.multiplyMatrices(t, r).multiply(tinv);
                                                    offset = {x: m.elements[12], y: m.elements[13], z: m.elements[14]};
                                                }
                                                applyOffset(pos, offset);
                                            }
                                            var target = keys[k].target;
                                            if (target) {
                                                applyOffset(target, globalOffset);
                                            }
                                            var points = keys[k].points;
                                            if (points) {
                                                for (var p = 0; p < points.length; p++) {
                                                    applyOffset(points[p], globalOffset);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    svf.animations = null;
                }
            });
        }
        else if (type == "Topology") {
            this.loadAsyncResource(loadContext, path, contents, function(data) {
                var jdr = new lmv.InputStream(data);
                var byteLength = data.byteLength;
                if (0 < byteLength) {
                    svf.topology = JSON.parse(jdr.getString(byteLength));
                } else {
                    svf.topology = null;
                }
            });
        }
        /*
         else if (type == "Autodesk.CloudPlatform.InstanceTree") {
         //TODO: instance tree, will be needed for selection
         //but let's skip the performance hit now -- we can
         //parse that in a worker thread after loading the rest.
         }
         */
    }


    if (this.pendingRequests == 0)
        this.postLoad(loadContext);

    delete this.unzip;
};

Package.prototype.addTransparencyFlagsToMaterials = function(mats) {
    for(var id in mats) {
        var mat = mats[id];
        var userAssets = mat["userassets"];
        var innerMats = mat["materials"];
        var innerMat = innerMats[userAssets[0]];
        mat.transparent = innerMat["transparent"];
    }
};

Package.prototype.postLoad = function(loadContext) {

    //Combine camera instances and camera definitions -- we need
    //both to be loaded to get the camera list
    if (this.camDefPack && this.camInstPack) {
        for (var k = 0, kEnd = this.camInstPack.getEntryCounts(); k < kEnd; k++) {
            var inst = lmv.readInstance(this.camInstPack, k, this.placementTransform, this.globalOffset);
            var cam = lmv.readCameraDefinition(this.camDefPack, inst);

            //Apply any instance transform to get the camera to world space.
            if (inst.transform) {
                // Apply any transformations associated with the camera
                // to put it into world space
                inst.transform.transformPoint(cam.position);
                inst.transform.transformPoint(cam.target);
                inst.transform.transformDirection(cam.up);
            }

            this.cameras.push(cam);
        }

        delete this.camDefPack;
        delete this.camInstPack;
    }


    //Lights need the same thing as the cameras
    if (this.lightDefPack && this.lightInstPack) {
        for (var k = 0, kEnd = this.lightInstPack.getEntryCounts(); k < kEnd; k++) {
            var inst = lmv.readInstance(this.lightInstPack, k, this.placementTransform, this.globalOffset);
            this.lights.push(lmv.readLightDefinition(this.lightDefPack, inst.definition));
        }

        delete this.lightInstPack;
        delete this.lightDefPack;
    }

    //Post processing step -- splice geometry metadata information
    //into the fragments list, in case it was given separately
    //TODO: consider keeping the geom metadata as is instead of splicing
    //into the fragments, as it would be more efficient --
    //but that would require special handling on the viewer side,
    //changing the fragment filter code, etc.
    var frags = this.fragments;

    if (this.geomMetadata) {

        //reusing the geomDataIndexes array to store
        //polygon counts, now that we don't need the geomIndexes
        //after this loop.
        frags.polygonCounts = frags.geomDataIndexes;

        var gm = this.geomMetadata;

        // Holds the indexes to the topology data.
        if (gm.topoIndexes != undefined) {
            frags.topoIndexes = new Int32Array(frags.length);
        }

        for (var i= 0, iEnd=frags.length; i<iEnd; i++) {
            var geomIndex = frags.geomDataIndexes[i];
            frags.entityIndexes[i] = gm.entityIndexes[geomIndex];
            frags.packIds[i] = gm.packIds[geomIndex];

            frags.polygonCounts[i] = gm.primCounts[geomIndex];
            this.primitiveCount += gm.primCounts[geomIndex];

            // Fills in the indexes to the topology data.
            if (gm.topoIndexes != undefined) {
                frags.topoIndexes[i] = gm.topoIndexes[geomIndex];
            }
        }

        frags.geomDataIndexes = null;

        this.geomMetadata = null;
    }

    //Build a map from mesh to its referencing fragment(s)
    //So that we can quickly find them once meshes begin loading
    //incrementally. This requires the packIds and entityIndexes
    //to be known per fragment, so it happens after geometry metadata
    //is resolved above
    {
        var mesh2frag = frags.mesh2frag = {};
        var packIds = frags.packIds;
        var entityIndexes = frags.entityIndexes;

        for (var i= 0, iEnd=frags.length; i<iEnd; i++) {
            var meshid = packIds[i] + ":" + entityIndexes[i];

            var meshRefs = mesh2frag[meshid];
            if (meshRefs === undefined) {
                //If it's the first fragments for this mesh,
                //store the index directly -- most common case.
                mesh2frag[meshid] = i;
            }
            else if (!Array.isArray(meshRefs)) {
                //otherwise put the fragments that
                //reference the mesh into an array
                mesh2frag[meshid] = [meshRefs, i];
            }
            else {
                //already is an array
                meshRefs.push(i);
            }
        }
    }

    //if we don't know the overall scene bounds, compute them from the
    //fragment boxes
    if (!this.bbox || loadContext.placementTransform) {

        if (this.bbox && loadContext.placementTransform)
            this.modelBox = this.bbox;

        var totalbox = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
        var fragBoxes = frags.boxes;

        for (var f= 0, fEnd=frags.length; f<fEnd; f++) {
            var bboff = f*6;
            var i;
            for (i=0; i<3; i++)
                if (fragBoxes[bboff+i] < totalbox[i])
                    totalbox[i] = fragBoxes[bboff+i];

            for (i=3; i<6; i++)
                if (fragBoxes[bboff+i] > totalbox[i])
                    totalbox[i] = fragBoxes[bboff+i];
        }

        this.bbox = {
                        min: { x:totalbox[0], y:totalbox[1], z:totalbox[2]},
                        max: { x:totalbox[3], y:totalbox[4], z:totalbox[5]}
                     };
    }


    // If object ids are specified, clean up pack file list by only keeping the packs that's
    // we intended to load.
    var ids = loadContext.objectIds;
    if (ids != null) {
        var packIds = [];
        var fragIndexes = [];
        // Pick out pack ids that referenced by fragments with specified db ids.
        for (var i = 0; i < ids.length; ++i) {
            for (var j = 0; j < this.fragments.length; ++j) {
                if (this.fragments.fragId2dbId[j] == ids[i]) {
                    packIds.push(this.fragments.packIds[j]);
                    fragIndexes.push(j);
                }
            }
        }

        // Two fragments could reference same pack file, so packIds may contain duplicates.
        // Remove any duplicates here.
        var end = 1, n = packIds.length; // end is the length of reduced array.
        for (var i = 1; i < n;) {
            while (i < n && packIds[i] == packIds[i - 1])
                ++i;
            if (n == i)
                break;
            packIds[end++] = packIds[i++];
        }
        packIds.splice(end - 1, n - end);

        // Reduce pack files based on selected pack ids.
        var packs = [];
        for (var i = 0; i < this.geompacks.length; ++i) {
            for (var j = 0; j < packIds.length; ++j) {
                // LMVTK pre-2.0 release uses integers for pack file id.
                // LMVTK 2.0 release uses integer + .pf as id.
                // We just drop the suffix here as we did in SVFLoader.
                // More info: https://git.autodesk.com/A360/LMVTK/commit/68b8c07a643a7ac39ecd5651d031d170e3a325be
                if (parseInt(this.geompacks[i].id) == packIds[j])
                    packs.push(this.geompacks[i]);
            }
        }
        this.geompacks = packs;

        var bb = lmv.filterFragments(this.fragments, fragIndexes);
        this.bbox = {
                        min: { x:bb[0], y:bb[1], z:bb[2] },
                        max: { x:bb[3], y:bb[4], z:bb[5]}
                    };
    }

    // POST svf once it's available if we don't care about keep the fragments in memory
    // a little bit longer for BVH building.
    if (!this.memoryOptimizedMode) {
        loadContext.loadDoneCB("svf");
    }

    if (this.fragments.polygonCounts) {
        //Build the R-Tree
        var t0 = performance.now();
        var mats = this.materials ? this.materials["materials"] : null;
        if (mats)
            this.addTransparencyFlagsToMaterials(mats);
        this.bvh = new avp.BVHBuilder(this.fragments, mats);
        this.bvh.build(loadContext.bvhOptions);
        var t1 = performance.now();
        loadContext.worker.debug("BVH build time (worker thread):" + (t1 - t0));

        if (this.memoryOptimizedMode) {
            // In memory optimized mode, delay posting SVF by waiting until BVH build finishes;
            // then post both BVH and SVF to main thread together.
            loadContext.loadDoneCB("svf");
        }
        else {
            // In normal mode, just post back BVH as svf is already posted back earlier.
            loadContext.loadDoneCB("bvh");
        }
    }

    loadContext.loadDoneCB("done");
};

lmv.Package = Package;

})();

(function() {

"use strict";

var lmv = Autodesk.LMVTK;

/** @constructor */
function PropertyDatabase(dbjsons) {

    "use strict";

    //The property db json arrays.
    //Some of them are held unparsed in blob form
    //with helper arrays containing offsets into the blobs for each value to be parsed on demand
    var _attrs;
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

    // externalId into dbInd node mapping, constructed upon first usage
    var _externalIdToDbId;
    //var _dbIdToExternalId;

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

        //Start offset of this object's properties in the Attribute-Values table
        var propStart = 2 * _offsets[dbId];

        //End offset of this object's properties in the Attribute-Values table
        var propEnd = 2 * _offsets[dbId+1];

        //Loop over the attribute index - value index pairs for the objects
        //and for each one look up the attribute and the value in their
        //respective arrays.
        for (var i=propStart; i<propEnd; i+=2) {
            var attrId = _avs[i];

            if (attrId == _instanceOfAttrId) {
                //Recursively resolve any common properties from the parent of this instance
                var res = this.getObjectProperties(this.getValueAt(_avs[i+1]), propFilter);
                if (res && res.properties) {
                    parentProps = res;
                }
                continue;
            }

            var attr = _attrs[attrId];

            if (propFilter && propFilter.indexOf(attr[0]) === -1 && propFilter.indexOf(attr[5]) === -1 )
                continue;

            if (propIgnored && (propIgnored.indexOf(attr[0]) > -1 || propIgnored.indexOf(attr[5]) > -1 ))
                continue;

            if (attrId == _nameAttrId) {
                var val = this.getValueAt(_avs[i+1]);
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
                    continue;
                }
                result.properties.push({
                    displayName: displayName,
                    displayValue: this.getValueAt(_avs[i+1]),
                    displayCategory: attr[1],
                    type: attr[2],
                    units: attr[3],
                    hidden: hidden
                });
            }
        }

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
        if (!_externalIdToDbId) {
            // build mapping //
            _externalIdToDbId = {};
            //_dbIdToExternalId = [];
            if (_idsOffsets && 'length' in _idsOffsets) { // Check that it's an indexable type
                for (var dbId=1, len=_idsOffsets.length; dbId<len; ++dbId) {
                    var externalId = this.getIdAt(dbId);
                    _externalIdToDbId[externalId] = dbId;
                    //_dbIdToExternalId[dbId] = externalId;
                }
            }
        }
        return _externalIdToDbId;
    };

    //Heuristically find the root node(s) of a scene
    //A root is a node that has children, has no (or null) parent and has a name.
    //There can be multiple nodes at the top level (e.g. Revit DWF), which is why
    //we should get the scene root with absolute certainty from the SVF instance tree,
    //but we would have to uncompress and parse that in -- something that is
    //not currently done. This is good enough for now (if pretty slow).
    this.findRootNodes = function() {
        var idroots = [];
        for (var id = 1, idend=_offsets.length; id<idend; id++) {
            var hasChild = false;
            var hasParent = false;
            var hasName = false;

            var propStart = 2 * _offsets[id];

            var propEnd = 2 * _offsets[id+1];

            for (var i=propStart; i<propEnd; i+=2) {
                var attrId = _avs[i];

                if (attrId == _parentAttrId) {
                    if (this.getIntValueAt(_avs[i+1])) //checks for null or zero parent id, in which case it's considered non-parent
                        hasParent = true;
                } else if (attrId == _childAttrId) {
                    hasChild = true;
                }
                else if (attrId == _nameAttrId) {
                    hasName = true;
                }
            }

            if (hasChild && hasName && !hasParent) {
                idroots.push(id);
            }
        }

        return idroots;
    };

    //Gets the immediate children of a node with the given dbId
    this.getNodeNameAndChildren = function(node /* {dbId:X, name:""} */, skipChildren) {

        var id = node.dbId;

        var propStart = 2 * _offsets[id];
        var propEnd = 2 * _offsets[id+1];

        var children;

        for (var i=propStart; i<propEnd; i+=2) {
            var attrId = _avs[i];
            var val;

            if (attrId == _parentAttrId) {
                //node.parent = this.getIntValueAt(_avs[i+1]); //eventually we will needs this instead of setting parent pointer when creating children below.
            } else if (attrId == _childAttrId && !skipChildren) {
                val = this.getIntValueAt(_avs[i+1]);
                var child = { dbId:val, parent:node.dbId };
                if (!children)
                    children = [child];
                else
                    children.push(child);

            } else if (attrId == _nameAttrId) {
                node.name = this.getValueAt(_avs[i+1]); //name is necessary for GUI purposes, so add it to the node object explicitly
            } else if (attrId == _nodeFlagsAttrId) {
                node.flags = this.getIntValueAt(_avs[i+1]); //flags are necessary for GUI/selection purposes, so add them to the node object
            }
        }

        //If this is an instance of another object,
        //try to get the object name from there.
        //This is not done in the main loop above for performance reasons,
        //we only want to do the expensive thing of going up the object hierarchy
        //if the node does not actually have a name attribute.
        if (!node.name) {
            for (var i=propStart; i<propEnd; i+=2) {
                var attrId = _avs[i];
                if (attrId == _instanceOfAttrId) {
                     var tmp = { dbId:this.getIntValueAt(_avs[i+1]), name:null };
                     this.getNodeNameAndChildren(tmp, true);
                     if (tmp && tmp.name && !node.name)
                     node.name = tmp.name;
                }
            }
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

            //Collect database IDs of objects that contain the found property values
            for (var id = 1, idend=_offsets.length; id<idend; id++) {
                var propStart = 2 * _offsets[id];
                var propEnd = 2 * _offsets[id+1];
                var name = "";
                var item = null;

                for (var i=propStart; i<propEnd; i+=2) {
                    var attrId = _avs[i];
                    var attr = _attrs[attrId];
                    var displayName = (attr[5]) ? attr[5] : attr[0];

                    if(completeInfo && displayName.toLowerCase() === "name") {
                        name = this.getValueAt(_avs[i + 1]);
                    }

                    if (matching_vals.indexOf(_avs[i+1]) != -1) {
                        //Check attribute name in case a restriction is passed in
                        if (attributeNames && attributeNames.length && attributeNames.indexOf(_attrs[_avs[i]][0]) === -1)
                            continue;

                        result.push(id);
                        item = {id: id, nodeName: "", value: this.getValueAt(_avs[i + 1]), name: displayName};
                        break;
                    }
                }
                if (item && completeInfo && k === 0) {
                    //since we return the intersection we just get the completeInfo for the first term
                    item.nodeName = name;
                    if (searchList.length === 1) {
                        completeResults.push(item);
                    } else {
                        resultNames[id] = item;
                    }

                }
            }

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

}

lmv.PropertyDatabase = PropertyDatabase;

})();


(function() {

"use strict";

var av = Autodesk.Viewing,
    avp = av.Private;
var lmv = Autodesk.LMVTK;

var F2dDataType = {
    //Fixed size types
    dt_object : 0,
    dt_void : 1,
    dt_byte : 2,
    dt_int : 3,
    dt_float : 4,
    dt_double : 5,
    dt_varint : 6,
    dt_point_varint : 7,

    //Variable size types
    //Data bytes are prefixed by an integer
    //representing the number of elements in the array.
    dt_byte_array : 32,
    dt_int_array : 33,
    dt_float_array : 34,
    dt_double_array : 35,
    dt_varint_array : 36,
    //Special variable int encoding for point data
    dt_point_varint_array : 37,

    //Well-known data types that help reduce output size for commonly
    //encountered simple geometries
    dt_arc : 38,
    dt_circle : 39,
    dt_circular_arc : 40,

    dt_string : 63,
    //do not want to go into varint range
    dt_last_data_type : 127
};

var F2dSemanticType = {
    //For objects with fixed serialization (arc, raster) we don't bother having dedicated semantic for each member
    //and assume the parsing application knows the order they appear. There is still an end-object tag of course
    //which shows where the object ends.
    st_object_member : 0,

    //Simple / fixed size attributes
    st_fill : 1,
    st_fill_off : 2,
    st_clip_off : 3,
    st_layer : 4,
    st_link : 5,
    st_line_weight : 6,
    st_miter_angle : 7,
    st_miter_length : 8,
    st_line_pattern_ref : 9,
    st_back_color : 10,
    st_color : 11,
    st_markup : 12,
    st_object_id : 13,
    st_markup_id : 14,
    st_reset_rel_offset : 15,
    st_font_ref : 16,

    //Compound object opcodes

    //Begin a generic object opcode
    st_begin_object : 32,

    //Style attribute related opcodes. Those are compound objects
    st_clip : 33,
    st_line_caps : 34,
    st_line_join : 35,
    st_line_pattern_def : 36,
    st_font_def : 37,
    st_viewport : 38,

    //Drawables are all objects-typed bounded by begin/end object opcodes

    //Root level document begin
    st_sheet : 42,
    //Circle, Ellipse, Arcs
    st_arc : 43,
    //The grandfather of them all
    st_polyline : 44,
    st_raster : 45,
    st_text : 46,
    st_polytriangle : 47,
    st_dot : 48,
    //end object -- could be ending a generic object or drawable, etc.
    st_end_object : 63,

    st_last_semantic_type : 127
};



function F2D(metadata, manifest, basePath, options) {
    this.metadata = metadata;
    this.scaleX = 1;
    this.scaleY = 1;
    this.bbox = { min:{x:0,y:0,z:0}, max:{x:0,y:0,z:0} };
    this.is2d = true;
    this.layersMap = {};
    this.fontDefs = {};
    this.fontCount = 0;
    this.fontId = 0;
    this.manifestAvailable = false;

    this.objectMemberQueue = [];

    this.propertydb = {
        attrs : [],
        avs: [],
        ids: [],
        values: [],
        offsets: [],
        rcv_offsets: [],
        rcvs : [],
        viewables: []
    };

    if (metadata) {

        var dims = metadata.page_dimensions;

        this.paperWidth = dims.page_width;
        this.paperHeight = dims.page_height;

        // TODO: scale parsing.
        this.scaleX = this.paperWidth / dims.plot_width;
        this.scaleY = this.paperHeight / dims.plot_height;

        this.hidePaper = dims.hide_paper;

        this.bbox.max.x = this.paperWidth;
        this.bbox.max.y = this.paperHeight;

        //Initialize mapping between layer index -> layer number to be used for rendering
        var count = 0;
        //Some geometry comes on null layer, and we reserve a spot for that one.
        //For example, Revit plots have no layers at all.
        this.layersMap[0] = count++;

        for (var l in metadata.layers) {

            var index = parseInt(l);

            //We store in a map in order to allow non-consecutive layer numbers,
            //which does happen.
            this.layersMap[index] = count++;
        }

        this.layerCount = count;

        //Create a layers tree to be used by the UI -- this splits AutoCAD style
        //layer groups (specified using | character) into a tree of layers.
        this.createLayerGroups(metadata.layers);
    }

    this.hidePaper = this.hidePaper || (options && options.modelSpace);

    // For debugging only. Could be removed.
    this.opCount = 0;


    this.fontFaces = [];
    this.fontFamilies = [];
    this.viewports = [0]; // make viewport index start at 1, 0 as paper is used in LineShader
    this.currentVpId = 0; // current viewport index
    this.clips = [0]; // make clip index start at 1, matched with viewport index

    this.strings = [];
    this.stringDbIds = [];
    this.stringBoxes = [];
    this.currentStringNumber = -1;
    this.currentStringBox = new LmvBox3();

    this.objectNumber = 0;
    this.currentFakeId = -2; //We tag certain objects that we care about (like strings) that have no ID with fake negative IDs instead of giving them default ID of 0.
    this.imageNumber = 0;
    this.maxObjectNumber = 0;

    this.objectStack = [];
    this.objectNameStack = [];
    this.parseObjState = {
        polyTriangle : {},
        viewport : {},
        clip : {},
        raster : {},
        text: {},
        fontDef: {},
        uknown: {}
    };

    this.layer = 0;

    this.bgColor = (typeof options.bgColor === "number") ? options.bgColor : 0xffffffff;

    //NOTE: Use of contrast color is turned off in mapColor() until UX makes up their mind
    //one way or another.
    this.contrastColor = this.color = this.fillColor = 0xff000000;
    if (this.hidePaper)
        this.contrastColor = 0xffffff00;

    this.currentVbb = new avp.VertexBufferBuilder(false);
    this.meshes = [];

    this.numCircles = this.numEllipses = this.numPolylines = this.numLineSegs = 0;
    this.numPolytriangles = this.numTriangles = 0;

    // Newly added f2d pasing stuff.
    this.error = false;

    // Last absolute positions of point parsed so far.
    // Used to decode relative positions parsed from points array.
    this.offsetX = 0;
    this.offsetY = 0;

    // Parse manifest, do stuff.
    // 1. Build image id to raster URI map used to assign values to texture path.
    // 2. Acquire names of property database json streams.
    if (manifest) {
        this.manifestAvailable = true;
        this.imageId2URI = {};
        var assets = manifest.assets;
        for (var i = 0, e = assets.length; i < e; ++i) {
            var entry = assets[i];
            var mime = entry.mime;
            if (mime.indexOf('image/') != -1) {
                var id = entry.id;
                id = id.substr(0, id.indexOf('.'));
                this.imageId2URI[id] = basePath + entry.URI;
            }

            if (entry.type == "Autodesk.CloudPlatform.PropertyAttributes")
                this.propertydb.attrs.push(entry.URI);
            if (entry.type == "Autodesk.CloudPlatform.PropertyValues")
                this.propertydb.values.push(entry.URI);
            if (entry.type == "Autodesk.CloudPlatform.PropertyIDs")
                this.propertydb.ids.push(entry.URI);
            if (entry.type == "Autodesk.CloudPlatform.PropertyViewables")
                this.propertydb.viewables.push(entry.URI);
            if (entry.type == "Autodesk.CloudPlatform.PropertyOffsets") {
                if (entry.id.indexOf('rcv') != -1)
                    this.propertydb.rcv_offsets.push(entry.URI);
                else
                    this.propertydb.offsets.push(entry.URI);
            }
            if (entry.type == "Autodesk.CloudPlatform.PropertyAVs")
                this.propertydb.avs.push(entry.URI);
            if (entry.type == "Autodesk.CloudPlatform.PropertyRCVs")
                this.propertydb.rcvs.push(entry.URI);
        }

    }
}

F2D.prototype.load = function(loadContext, fydoPack) {

    if (!(fydoPack instanceof Uint8Array))
        fydoPack = new Uint8Array(fydoPack);
    this.data = fydoPack;
    this.parse();

    if (this.stringBoxes.length) {
        var fbuf = new Float32Array(this.stringBoxes.length);
        fbuf.set(this.stringBoxes);
        this.stringBoxes = fbuf;
    }

    loadContext.loadDoneCB(true);
};

F2D.prototype.loadFrames = function(loadContext) {

    this.loadContext = loadContext;

    var data = loadContext.data;

    if (data) {
        if (!(data instanceof Uint8Array))
            data = new Uint8Array(data);
        this.data = data;
    } else if (loadContext.finalFrame) {
        this.data = null;

        if (this.stringBoxes.length) {
            var fbuf = new Float32Array(this.stringBoxes.length);
            fbuf.set(this.stringBoxes);
            this.stringBoxes = fbuf;
        }
    }

    this.parseFrames(loadContext.finalFrame);

    loadContext.loadDoneCB(true);
};


F2D.prototype.flushBuffer = function(addCount, finalFlush)
{
    if (!this.currentVbb.vcount && !finalFlush)
    {
        return;
    }

    var flush = finalFlush;
    flush = flush || this.currentVbb.isFull(addCount);

    if (flush) {
        if (this.currentVbb.vcount) {
            var mesh = this.currentVbb.toMesh();
            lmv.VBUtils.bboxUnion(this.bbox, mesh.boundingBox);
            this.meshes.push(mesh);


            mesh.material = {
                                skipEllipticals : !this.currentVbb.numEllipticals,
                                skipCircles: !this.currentVbb.numCirculars,
                                skipTriangleGeoms : !this.currentVbb.numTriangleGeoms,
                                useInstancing : this.currentVbb.useInstancing
                            };

            if (this.currentImage) {
                mesh.material.image = this.currentImage;
                mesh.material.image.name = this.imageNumber++;
                this.currentImage = null;
            }

            this.currentVbb = new avp.VertexBufferBuilder();
        }

        if (this.loadContext)
            this.loadContext.loadDoneCB(true, finalFlush);
    }


};

F2D.prototype.tx = function(x) {
    return this.sx(x);
};

F2D.prototype.ty = function(y) {
    return this.sy(y);
};

F2D.prototype.sx = function(x) {
    //TODO: The hardcoded scale is used to get the integer coords from FYDO
    //into something normal and close to page coordinates
    return x * this.scaleX;
};

F2D.prototype.sy = function(y) {
    //TODO: The hardcoded scale is used to get the integer coords from FYDO
    //into something normal and close to page coordinates
    return y * this.scaleY;
};

F2D.prototype.invertColor = function(c) {
    var a = ((c >> 24) & 0xff);
    var b = ((c >> 16) & 0xff);
    var g = ((c >>  8) & 0xff);
    var r = ((c)       & 0xff);

    b = 255 - b;
    g = 255 - g;
    r = 255 - r;

    return (a << 24) | (b << 16) | (g << 8) | r;
};

F2D.prototype.mapColor = function(c, isFill) {

    if (!this.hidePaper)
        return c;

    if (this.bgColor !== 0)
        return c;

    //Color substitution in cases when we want to interleave the 2D drawing
    //into a 3D scene (when bgColor is explicitly specified as transparent black (0)
    //and hidePaper is set to true.

    var r = c & 0xff;
    var g = (c & 0xff00) >> 8;
    var b = (c & 0xff0000) >> 16;

    var isGrey = (r === g) && (r === b);

    if (r < 0x7f) {
        //c = this.contrastColor;
    } else if (isGrey && isFill) {
        c = c & 0x99ffffff;
    }

    return c;
};

// ====================== F2D Parser ================================= //

// Restore sign bit from LSB of an encoded integer which has the sign bit
// moved from MSB to LSB.
// The decoding process is the reverse by restoring the sign bit from LSB to MSB.
F2D.prototype.restoreSignBitFromLSB = function(integer) {
    return (integer & 1) ? -(integer >>> 1) : (integer >>> 1);
};

// Convert relative positions to absolute positions, and update global offsets.
F2D.prototype.parsePointPositions = function() {
    var x = this.stream.getVarints();
    var y = this.stream.getVarints();

    x = this.restoreSignBitFromLSB(x);
    y = this.restoreSignBitFromLSB(y);

    x += this.offsetX;
    y += this.offsetY;

    this.offsetX = x;
    this.offsetY = y;

    return [this.tx(x), this.ty(y)];
};

F2D.prototype.parserAssert = function(actualType, expectedType, functionName) {
    if (actualType != expectedType) {
        avp.logger.warn("Expect " + expectedType + "; actual type is " +
            actualType + "; in function " + functionName);
        this.error = true;
        return true;
    } else {
        return false;
    }
};

F2D.prototype.unhandledTypeWarning = function(inFunction, semanticType) {
    avp.logger.warn("Unhandled semantic type : " + semanticType + " in function " + inFunction);
};

F2D.prototype.parseObject = function() {
    var semantic_type = this.stream.getVarints();
    this.objectStack.push(semantic_type);
    //debug(semantic_type);
    switch (semantic_type) {
        case F2dSemanticType.st_sheet :
            this.objectNameStack.push("sheet");
            this.objectMemberQueue.unshift("paperColor");
            break;
        case F2dSemanticType.st_viewport :
            this.objectNameStack.push("viewport");
            this.objectMemberQueue.unshift("units", "transform");
            break;
        case F2dSemanticType.st_clip :
            this.objectNameStack.push("clip");
            this.objectMemberQueue.unshift("contourCounts", "points", "indices");
            break;
        case F2dSemanticType.st_polytriangle :
            this.objectNameStack.push("polyTriangle");
            this.objectMemberQueue.unshift("points", "indices", "colors");
            break;
        case F2dSemanticType.st_raster:
            this.objectNameStack.push("raster");
            this.objectMemberQueue.unshift("position", "width", "height", "imageId");
            break;
        case F2dSemanticType.st_text:
            this.currentStringNumber = this.strings.length;
            if (this.objectNumber === 0)
                this.objectNumber = this.currentFakeId--;
            this.currentStringBox.makeEmpty();
            this.objectNameStack.push("text");
            this.objectMemberQueue.unshift("string", "position", "height", "widthScale", "rotation", "oblique", "charWidths");
            break;
        case F2dSemanticType.st_font_def:
            this.objectNameStack.push("fontDef");
            this.objectMemberQueue.unshift("name", "fullName", "flags", "spacing", "panose");
            break;
        case F2dSemanticType.st_end_object : {
                this.objectStack.pop(); //pop the end_object we pushed at the beginning of the function

                if (!this.objectStack.length)
                    this.parserAssert(0,1, "parseEndObject (Stack Empty)");
                else {
                    //Do any end-of-object post processing depending on object type
                    var objType = this.objectStack.pop(); //pop the start object

                    switch (objType) {
                        case F2dSemanticType.st_polytriangle:   this.actOnPolyTriangle(); break;
                        case F2dSemanticType.st_viewport:       this.actOnViewport(); break;
                        case F2dSemanticType.st_clip:           this.actOnClip(); break;
                        case F2dSemanticType.st_raster:         this.actOnRaster(); break;
                        case F2dSemanticType.st_text:           this.actOnText(); break;
                        case F2dSemanticType.st_font_def:       this.actOnFontDef(); break;
                    }

                    //Zero out the state of the object we just finished processing
                    var name = this.objectNameStack.pop();
                    var state = this.parseObjState[name];
                    for (var p in state)
                        state[p] = null;
                }

                this.objectMemberQueue.length = 0;
            }
            break;
        default:
            this.objectNameStack.push("unknown");
            this.error = true;
            this.unhandledTypeWarning('parseObject', semantic_type);
            break;
    }
};


F2D.prototype.initSheet = function(paperColor) {

    this.bgColor = paperColor;

    if (this.hidePaper)
        return;

    if (this.metadata) {

        var pw = this.paperWidth;
        var ph = this.paperHeight;

        var vbb = this.currentVbb;

        var ss = pw * 0.0075;
        var shadowColor = 0xff555555;

        var points = [0,0, pw,0, pw,ph, 0,ph,
                      ss,-ss, pw+ss,-ss, pw+ss,0, ss,0,
                      pw,0, pw+ss,0, pw+ss,ph-ss, pw, ph-ss];
        var colors = [paperColor, paperColor, paperColor, paperColor,
                      shadowColor, shadowColor, shadowColor,shadowColor,
                      shadowColor, shadowColor, shadowColor,shadowColor];

        var indices = [0,1,2,0,2,3,
                       4,5,6,4,6,7,
                       8,9,10,8,10,11];

        var paperLayer = 0; //Put the paper the null layer so it won't get turned off.
        var paperDbId = -1;

        this.addPolyTriangle(points, colors, indices, 0xffffffff, paperDbId, paperLayer, false);

        //Page outline
        vbb.addSegment(0,0,pw,0,   0, 1e-6, 0xff000000, paperDbId, paperLayer, this.currentVpId);
        vbb.addSegment(pw,0,pw,ph, 0, 1e-6, 0xff000000, paperDbId, paperLayer, this.currentVpId);
        vbb.addSegment(pw,ph,0,ph, 0, 1e-6, 0xff000000, paperDbId, paperLayer, this.currentVpId);
        vbb.addSegment(0,ph,0,0,   0, 1e-6, 0xff000000, paperDbId, paperLayer, this.currentVpId);


        //Test pattern for line styles.
//        for (var i=0; i<39; i++) {
//            vbb.addSegment(0, ph + i * 0.25 + 1, 12, ph + i * 0.25 + 1, 0, -1 /* device space pixel width */, 0xff000000, 0xffffffff, 0, 0, i);
//        }

        //Test pattern for line styles.
//        for (var i=0; i<39; i++) {
//            vbb.addSegment(0, ph + (i+39) * 0.25 + 1, 12, ph + (i+39) * 0.25 + 1, 0, (1.0 / 25.4) /*1mm width*/, 0xff000000, 0xffffffff, 0, 0, i);
//        }

    }
};

F2D.prototype.setObjectMember = function(val) {
    if (!this.objectMemberQueue.length) {
        avp.logger.warn("Unexpected object member. " + val + " on object " + this.objectNameStack[this.objectNameStack.length-1]);
        return false;
    }

    var propName = this.objectMemberQueue.shift();
    var curObjName = this.objectNameStack[this.objectNameStack.length-1];

    //The paper color needs to be processed as soon as it comes in
    //because we want to initialize the page geometry first, before
    //adding any other geometry
    if (curObjName == "sheet" && propName == "paperColor") {
        this.initSheet(val);
        return true;
    }
    else if (curObjName) {
        this.parseObjState[curObjName][propName] = val;
        return true;
    }

    return false;
};


F2D.prototype.parseString = function() {
    var s = this.stream;
    var sema = s.getVarints();

    var len = s.getVarints();
    var ret = s.getString(len);

    switch (sema) {
        case F2dSemanticType.st_object_member:
            if (this.setObjectMember(ret))
                return;
            break;
        default: avp.logger.info("Unexpected opcode semantic type for string.");  break;
    }

    return ret;
};


F2D.prototype.actOnFontDef = function() {
    var fontDef = this.parseObjState.fontDef;
    this.fontDefs[++this.fontCount] = fontDef;
    this.fontId = this.fontCount;
};


F2D.prototype.parsePoint = function() {
    var s = this.stream;
    var sema = s.getVarints(); //skip past the semantics
    var ret = this.parsePointPositions();

    switch (sema) {
        case F2dSemanticType.st_object_member:
            if (this.setObjectMember(ret))
                return;
            break;
        default: avp.logger.info("Unexpected opcode semantic type for point.");  break;
    }

    return ret;
};


F2D.prototype.parsePointsArray = function() {

    var s = this.stream;

    var sema = s.getVarints();

    var count = s.getVarints(); // number of coordinates * 2
    if (!count) return;
    count = count / 2;

    var ret = [];
    var position;

    for (var i = 0; i < count; ++i) {
        position = this.parsePointPositions();
        ret.push(position[0]);
        ret.push(position[1]);
    }

    switch (sema) {
        case F2dSemanticType.st_polyline :
            this.actOnPolylinePointsArray(ret);
            return;
        case F2dSemanticType.st_dot:
            this.actOnDot(ret);
            return;
        case F2dSemanticType.st_object_member:
            if (this.setObjectMember(ret))
                return;
            break;
        default: avp.logger.info("Unexpected opcode semantic type for points array.");  break;
    }

    return ret;
};

F2D.prototype.parseIntArray = function() {
    var s = this.stream;
    var sema = s.getVarints();
    var count = s.getVarints(); // total number of elements in integer array.
    var retVal = [];
    for (var i = 0; i < count; ++i) {
        retVal.push(s.getUint32());
    }

    switch (sema) {
        case F2dSemanticType.st_object_member:
            if (this.setObjectMember(retVal))
                return;
            break;
        default:
            this.unhandledTypeWarning('parseIntArray', sema);
            break;
    }

    return retVal;
};

F2D.prototype.parseDoubleArray = function() {
    var s = this.stream;
    var sema = s.getVarints();
    var count = s.getVarints(); // total number of elements in integer array.
    var retVal = [];
    for (var i = 0; i < count; ++i) {
        retVal.push(s.getFloat64());
    }

    switch (sema) {
        case F2dSemanticType.st_object_member:
            if (this.setObjectMember(retVal))
                return;
            break;
        default:
            this.unhandledTypeWarning('parseDoubleArray', sema);
            break;
    }

    return retVal;
};

F2D.prototype.parseByteArray = function() {
    var s = this.stream;
    var sema = s.getVarints();
    var count = s.getVarints(); // total number of elements in byte array.
    var retVal = [];
    for (var i = 0; i < count; ++i) {
        retVal.push(s.getUint8());
    }

    switch (sema) {
        case F2dSemanticType.st_object_member:
            if (this.setObjectMember(retVal))
                return;
            break;
        default:
            this.unhandledTypeWarning('parseByteArray', sema);
            break;
    }

    return retVal;
};


F2D.prototype.parseVarintArray = function() {
    var s = this.stream;
    var sema = s.getVarints();

    var ret = [];

    // Total number of integers in array, not the total number of bytes.
    var count = s.getVarints();

    for (var i = 0; i < count; ++i) {
        ret.push(s.getVarints());
    }

    switch (sema) {
        case F2dSemanticType.st_object_member:
            if (this.setObjectMember(ret))
                return;
            break;
        default:
            this.unhandledTypeWarning('parseVarIntArray', sema);
            break;
    }

    return ret;
};


F2D.prototype.parseInt = function() {
    var s = this.stream;
    var sema = s.getVarints();
    var val = s.getUint32();

    switch (sema) {
        case F2dSemanticType.st_color:
            this.color = this.mapColor(val, false);
            break;
        case F2dSemanticType.st_fill:
            this.fill = true;
            this.fillColor = this.mapColor(val, true);
            break;
        case F2dSemanticType.st_object_member:
            if (this.setObjectMember(val))
                return;
        default:
            this.unhandledTypeWarning('parseInt', sema);
            break;
    }

    return val;
};

F2D.prototype.parseVoid = function() {
  var sema = this.stream.getVarints();
  switch (sema) {
      case F2dSemanticType.st_fill_off:
          this.fill = false;
          break;
      default:
          this.unhandledTypeWarning('parseVoid', sema);
          break;
  }
};

F2D.prototype.parseVarint = function() {
    var s = this.stream;
    var semantic_type = s.getVarints();
    var val = s.getVarints();

    switch (semantic_type) {
        case F2dSemanticType.st_line_weight:
            this.lineWeight = this.tx(val);
            break;
        case F2dSemanticType.st_object_id:
        case F2dSemanticType.st_markup_id:
            this.objectNumber = val;
            this.maxObjectNumber = Math.max(this.maxObjectNumber, val);
            break;
        case F2dSemanticType.st_layer:
            this.layer = this.layersMap[val];
            break;
        case F2dSemanticType.st_font_ref:
            this.fontId = val;
            break;
        case F2dSemanticType.st_object_member:
            if (this.setObjectMember(val))
                return;
            break;
        default:
            break;
    }

    return val;
};

F2D.prototype.parseFloat = function() {
    var s = this.stream;
    var semantic_type = s.getVarints();
    var val = s.getFloat32();

    switch (semantic_type) {
        case F2dSemanticType.st_miter_angle:
            break;
        case F2dSemanticType.st_miter_length:
            break;
        case F2dSemanticType.st_object_member:
            if (this.setObjectMember(val)) {
                return;
            }
            break;
        default:
            break;
    }

    return val;
};

F2D.prototype.parseCircularArc = function() {
    var s = this.stream;
    var sema = s.getVarints();
    if (this.parserAssert(sema, F2dSemanticType.st_arc, 'parseCircularArc')) return;

    var point = this.parsePointPositions();
    var major = s.getVarints(), /*rotation = s.getFloat32(),*/ start = s.getFloat32(), end = s.getFloat32();

    this.actOnCircularArc(point[0], point[1], start, end, this.sx(major));
};

F2D.prototype.parseCircle = function() {
    var s = this.stream;
    var sema = s.getVarints();
    if (this.parserAssert(sema, F2dSemanticType.st_arc, 'parseCircle')) return;

    var point = this.parsePointPositions();
    var major = s.getVarints();

    this.actOnCompleteCircle(point[0], point[1], this.sx(major));
};

F2D.prototype.parseArc = function() {
    var s = this.stream;
    var sema = s.getVarints();
    if (this.parserAssert(sema, F2dSemanticType.st_arc, 'parseArc')) return;

    // Relative positions.
    var point = this.parsePointPositions();

    var major = s.getVarints();
    var minor = s.getVarints();

    var rotation = s.getFloat32();
    var start = s.getFloat32();
    var end = s.getFloat32();

    this.actOnArc(point[0], point[1], start, end, this.sx(major), this.sy(minor), rotation);
};

F2D.prototype.parseDataType = function() {
    var data_type = this.stream.getVarints();

    switch (data_type) {
        case F2dDataType.dt_void:
            this.parseVoid();
            break;
        case F2dDataType.dt_int :
            this.parseInt();
            break;
        case F2dDataType.dt_object :
            this.parseObject();
            break;
        case F2dDataType.dt_varint :
            this.parseVarint();
            break;
        case F2dDataType.dt_point_varint :
            this.parsePoint();
            break;
        case F2dDataType.dt_float :
            this.parseFloat();
            break;
        case F2dDataType.dt_point_varint_array :
            this.parsePointsArray();
            break;
        case F2dDataType.dt_circular_arc :
            this.parseCircularArc();
            break;
        case F2dDataType.dt_circle :
            this.parseCircle();
            break;
        case F2dDataType.dt_arc :
            this.parseArc();
            break;
        case F2dDataType.dt_int_array:
            this.parseIntArray();
            break;
        case F2dDataType.dt_varint_array:
            this.parseVarintArray();
            break;
        case F2dDataType.dt_byte_array:
            this.parseByteArray();
            break;
        case F2dDataType.dt_string:
            this.parseString();
            break;
        case F2dDataType.dt_double_array:
            this.parseDoubleArray();
            break;
        default:
            this.error = true;
            avp.logger.info("Data type not supported yet: " + data_type);
            break;
    }
};

F2D.prototype.parse = function() {
    var stream = this.stream = new lmv.InputStream(this.data);

    // "F2D"
    var header = stream.getString(3);

    if (header != "F2D") {
        avp.logger.error("Invalid F2D header : " + header);
        return;
    }

    var versionMajor = stream.getString(2);
    if (versionMajor != "01") {
        avp.logger.error("Only support f2d major version 1; actual version is : " + versionMajor);
        return;
    }

    var dot = stream.getString(1);
    if (dot != ".") {
        avp.logger.error("Invalid version delimiter.");
        return;
    }

    var versionMinor = stream.getString(2);

    while (stream.offset < stream.byteLength) {
        this.parseDataType();
        if (this.error)
            break;
        this.opCount++;
    }

    this.flushBuffer(0, true);
    this.currentVbb = null;

    this.stream = null;
    this.data = null;

    avp.logger.info("F2d parse: data types count : " + this.opCount);
};

F2D.prototype.parseFrames = function(flush) {

    if (this.data) {
        var stream = this.stream = new lmv.InputStream(this.data);
        while (stream.offset < stream.byteLength) {
            this.parseDataType();
            if (this.error)
                break;
            this.opCount++;
        }
    } else if (!flush) {
        avp.logger.warn("Unexpected F2D parse state: If there is no data, we only expect a flush command, but flush was false.");
    }

    if (flush) {
        this.flushBuffer(0, true);
    }

    this.stream = null;
    this.data = null;
};

// ================= Semantic Analysis Pass ======================//

F2D.prototype.actOnPolylinePointsArray = function(points) {

    this.flushBuffer();
    this.numPolylines ++;

    // For now only consider this.fill == false case.
    // TODO: handle fill case.

    var count = points.length / 2;

    var totalLen = 0;
    var x0 = points[0];
    var y0 = points[1];
    for (var i = 1; i < count; ++i) {
        var x1 = points[2*i];
        var y1 = points[2*i+1];

        // TODO: make sure this function can be reused as is.
        this.currentVbb.addSegment(x0, y0, x1, y1, totalLen, this.lineWeight, this.color, this.objectNumber, this.layer, this.currentVpId);

        totalLen += Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0));

        x0 = x1;
        y0 = y1;
    }

    this.numLineSegs += count - 1;
};

F2D.prototype.actOnDot = function(points) {

    var x0 = points[0];
    var y0 = points[1];

    this.actOnCompleteCircle(x0, y0, this.sx(1));
};


F2D.prototype.actOnCompleteCircle = function(cx, cy, radius) {
    // Relative positions.
    this.flushBuffer();
    this.numCircles++;

    if (this.fill) {
        //A simple filled circle can be handled
        //as degenerate thick line segment -- lots of these
        //in line style grass clippings
        this.currentVbb.addSegment(cx, cy, cx, cy, 0, 2 * radius, this.color, this.objectNumber,
            this.layer, this.currentVpId, true, false, true);
    } else {
        this.currentVbb.addArc(cx, cy, 0, 2 * Math.PI, /*major*/radius, /*minor*/radius, /*tilt*/0.0,
            this.lineWeight, this.color, this.objectNumber, this.layer, this.currentVpId);
    }
};

F2D.prototype.actOnCircularArc = function(cx, cy, start, end, radius) {
    this.numCircles++;
    this.flushBuffer();

//    debug("circle " + start + " " + end + " c " + this.color.toString(16));

    this.currentVbb.addArc(cx, cy, start, end, /*major*/radius, /*minor*/radius, /*tilt*/0.0,
        this.lineWeight, this.color, this.objectNumber, this.layer, this.currentVpId);
};

F2D.prototype.actOnArc = function(cx, cy, start, end, major, minor, rotation) {
    this.numEllipses++;
    // TODO: need this?
    this.flushBuffer();
    this.currentVbb.addArc(cx, cy, start, end, major, minor, rotation,
        this.lineWeight, this.color, this.objectNumber, this.layer, this.currentVpId);
};

F2D.prototype.actOnRaster = function() {

    if (!this.manifestAvailable)
        return;

    this.flushBuffer(4, true);

    var ps = this.parseObjState.raster;

    var position = ps.position,
        imageId  = ps.imageId,
        imageUri = this.imageId2URI[imageId];

    var width  = this.sx(ps.width),
        height = this.sy(ps.height);

    var centerX = position[0] + 0.5 * width,
        centerY = position[1] - 0.5 * height;

    this.currentVbb.addTexturedQuad(centerX, centerY, width, height, /*rotation*/0, 0xff00ffff, this.objectNumber, this.layer, this.currentVpId);
    this.currentImage = { dataURI: imageUri };

    //We can do one image per Vertex Buffer, so flush the quad
    this.flushBuffer(0, true);
};

F2D.prototype.actOnClip = function() {

    var v = this.parseObjState.clip;
    this.parseObjState.clip = {};

    this.clips.push(v);
};

F2D.prototype.actOnText = function() {
    //TODO: text not currently used for rendering,
    //but we collect the strings for search/lookup purposes
    this.strings[this.currentStringNumber] = this.parseObjState.text.string;
    this.stringDbIds[this.currentStringNumber] = this.objectNumber;
    this.stringBoxes.push(this.currentStringBox.min.x, this.currentStringBox.min.y, this.currentStringBox.max.x, this.currentStringBox.max.y);
    this.currentStringBox.makeEmpty();
    this.currentStringNumber = -1;
    if (this.objectNumber < -1)
        this.objectNumber = 0; //reset the current object ID in case we were using a fake one for the text object
};


var _tmpVector = new LmvVector3();

//Polytriangle processing differs depending on whether
//we want edge antialiasing and whether the renderer is using
//hardware instancing or not, so it require a lot more
//work than other geometries before sending raw primitives to the
//vertex buffer.
F2D.prototype.addPolyTriangle = function(points, colors, inds, color, dbId, layer, antialiasEdges) {
    var me = this;
    var edgeMap = null;

    //For non-text geometry we get good looking results with
    //1 pixel outlines. For text, which is generally small and highly detailed,
    //a 0.5 pixel AA outline does better.
    var aaLineWeight = -1.0; //negative = in pixel units
    if (this.objectStack[this.objectStack.length-1] == F2dSemanticType.st_text)
        aaLineWeight = -0.5;


    function processEdge(iFrom, iTo) {
        if (iFrom > iTo) {
            var tmp = iFrom;
            iFrom = iTo;
            iTo = tmp;
        }

        if (!edgeMap[iFrom])
            edgeMap[iFrom] = [iTo];
        else {
            var adjacentVerts = edgeMap[iFrom];
            var idx = adjacentVerts.lastIndexOf(iTo);
            if (idx == -1)
                adjacentVerts.push(iTo); //first time we see this edge, so remember it as exterior edge
            else
                adjacentVerts[idx] = -1; //the second time we see an edge mark it as interior edge
        }
    }


    function addAllAntialiasEdges() {

        for (var i = 0, iEnd = edgeMap.length; i<iEnd; i++) {

            var adjacentVerts = edgeMap[i];
            if (!adjacentVerts)
                continue;

            for (var j=0; j<adjacentVerts.length; j++) {
                var iTo = adjacentVerts[j];
                if (iTo == -1)
                    continue; //an interior edge was here -- skip
                else {
                    //exterior edge -- add an antialiasing line for it
                    me.flushBuffer(4);
                    me.currentVbb.addSegment(points[2*i], points[2*i+1],
                                             points[2*iTo], points[2*iTo+1],
                                             0,
                                             aaLineWeight,
                                             me.mapColor(colors ? colors[i] : color, true),
                                             dbId, layer, me.currentVpId);
{
                    if (colors && (colors[i] != colors[iTo]))
                        avp.logger.warn("Gouraud triangle encountered. Will have incorrect antialiasing.");}
                }
            }
        }
    }

    function antialiasOneEdge(iFrom, iTo) {
        if (iFrom > iTo) {
            var tmp = iFrom;
            iFrom = iTo;
            iTo = tmp;
        }

        var adjacentVerts = edgeMap[iFrom];
        if (!adjacentVerts)
            return;

        var idx = adjacentVerts.indexOf(iTo);
        if (idx != -1) {
            //exterior edge -- add an antialiasing line for it
            me.flushBuffer(4);
            me.currentVbb.addSegment(points[2*iFrom], points[2*iFrom+1],
                                     points[2*iTo], points[2*iTo+1],
                                     0,
                                     aaLineWeight,
                                     me.mapColor(colors ? colors[iFrom] : color, true),
                                     dbId, layer, me.currentVpId);

            if (colors && (colors[iFrom] != colors[iTo]))
                avp.logger.warn("Gouraud triangle encountered. Will have incorrect antialiasing.");
        }
    }

    if (antialiasEdges) {
        edgeMap = new Array(points.length/2);

        for (var i= 0, iEnd = inds.length; i<iEnd; i+= 3) {
            var i0 = inds[i];
            var i1 = inds[i+1];
            var i2 = inds[i+2];

            processEdge(i0, i1);
            processEdge(i1, i2);
            processEdge(i2, i0);
        }
    }

    //If the polytriangle is part of tesselated text, add it to the current
    //text object bounding box
    if (this.currentStringNumber !== -1) {
        var count = points.length / 2; // number of vertices
        for (var i = 0; i < count; ++i) {
            _tmpVector.set(points[2*i], points[2*i+1], 0);
            this.currentStringBox.expandByPoint(_tmpVector);
        }
    }

    if (this.currentVbb.useInstancing) {
        var count = inds.length;
        for (var i = 0; i < count; i+=3) {
            var i0 = inds[i];
            var i1 = inds[i+1];
            var i2 = inds[i+2];

            this.flushBuffer(4);

            this.currentVbb.addTriangleGeom(points[2*i0], points[2*i0+1],
                                            points[2*i1], points[2*i1+1],
                                            points[2*i2], points[2*i2+1],
                                            this.mapColor(colors ? colors[i0] : color, true), dbId, layer, this.currentVpId);

            if (antialiasEdges) {
                antialiasOneEdge(i0, i1);
                antialiasOneEdge(i1, i2);
                antialiasOneEdge(i2, i0);
            }
        }
    }
    else {
        var count = points.length / 2; // number of vertices

        this.flushBuffer(count);
        var vbb = this.currentVbb;
        var vbase = vbb.vcount;

        for (var i = 0; i < count; ++i) {
            var x = points[2*i];
            var y = points[2*i+1];
            vbb.addVertexPolytriangle(x, y, this.mapColor(colors ? colors[i] : color, true), dbId, layer, this.currentVpId);
        }

        vbb.addIndices(inds, vbase);

        if (antialiasEdges) {
            addAllAntialiasEdges();
        }

    }
};

F2D.prototype.actOnPolyTriangle = function() {

    var ptri = this.parseObjState.polyTriangle;
    this.parseObjState.polyTriangle = {};

    //if (this.objectStack[this.objectStack.length-1] == F2dSemanticType.st_text)
    //    return;

    var points = ptri.points;
    var inds = ptri.indices;
    var colors = ptri.colors;

    if (!points || !inds) {
        avp.logger.warn("Malformed polytriangle.");
        return;
    }

    this.numPolytriangles++;
    this.numTriangles += inds.length / 3;

    this.addPolyTriangle(points, colors, inds, this.color, this.objectNumber, this.layer, true);
};

F2D.prototype.actOnViewport = function() {

    var v = this.parseObjState.viewport;
    this.parseObjState.viewport = {};

    this.viewports.push(v);
    this.currentVpId = this.viewports.length - 1;
};

F2D.prototype.createLayerGroups = function(layers) {

    // Temporary: build the layers tree. Eventually the extractor
    // should be the one doing this; we're incompletely faking it
    // by looking at the layer names.
    //
    var layersRoot = this.layersRoot = {name: 'root', id: 'root', childrenByName: {}, isLayer: false};
    var groupId = 0, layerId = 0;

    for (var l in layers) {

        var index = parseInt(l);
        var layerDef = layers[l];

        var name = (typeof layerDef === "string") ? layerDef : layerDef.name;

        if (!name)
            name = l; //won't get here...

        var path = name.split('|');
        var parent = layersRoot;

        if (path.length > 1) {
            for (var i = 0; i < path.length - 1; ++i) {
                var pathComponent = path[i];
                var item = parent.childrenByName[pathComponent];
                if (!item) {
                    item = {
                        name: pathComponent,
                        id: 'group-' + groupId++,
                        childrenByName: {},
                        isLayer: false
                    };
                    parent.childrenByName[pathComponent] = item;
                }
                parent = item;
            }
        }

        parent.childrenByName[name] = {
            name: name,
            index: index,
            id: layerId++,
            childrenByName: {},
            isLayer: true
        };
    }

    function sortLayers(parent) {
        var children = Object.keys(parent.childrenByName).map(function(k) {return parent.childrenByName[k];});
        delete parent.childrenByName;

        if (children.length) {
            parent.children = children;

            parent.childCount = 0;

            for (var i = 0; i < children.length; ++i) {
                parent.childCount += sortLayers(children[i]);
            }

            children.sort(function (a, b) {
                if (a.isLayer && !b.isLayer) {
                    return -1; // Layers before groups
                } else if (!a.isLayer && b.isLayer) {
                    return 1;
                }
                return a.name.localeCompare(b.name, undefined, {sensitivity: 'base', numeric: true}); // Sort layers and groups by name
            });
        }

        return parent.isLayer ? 1 : parent.childCount;
    }
    sortLayers(this.layersRoot);
};

lmv.F2D = F2D;
lmv.F2dDataType = F2dDataType;
lmv.F2dSemanticType = F2dSemanticType;

})();


(function() {

"use strict";

var lmv = Autodesk.LMVTK;

function F2DProbe() {
    this.data = null;
    this.frameStart = 0;
    this.frameEnd = 0;
    this.stream = null;
    this.opCount = 0;
    this.marker = {frameStart : this.frameStart,
                   frameEnd : this.frameEnd};
}

F2DProbe.prototype.load = function(data) {
    this.data = data;
    this.frameStart = 0;

    if (!this.stream) {
        this.stream = new lmv.CheckedInputStream(this.data);
        // Skip headers.
        this.stream.seek(8);
        this.frameStart = 8;
        this.frameEnd = 8;
    }
    else {
        this.stream.reset(this.data);
        this.stream.seek(0);
        this.frameEnd = 0;
    }

    this.probe();
    this.marker.frameStart = this.frameStart;
    this.marker.frameEnd = this.frameEnd;
    return this.marker;
};

var F2dProbeDataType = lmv.F2dDataType;
var F2dProbeSemanticType = lmv.F2dSemanticType;

F2DProbe.prototype.readColor = function() {
    var s = this.stream;
    s.getVarints();// data type : dt_int 3
    s.getVarints(); // semantic type : st_object_member 0
    s.skipUint32(); // color
};

F2DProbe.prototype.parsePointPositions = function() {
    this.stream.getVarints();
    this.stream.getVarints();
};

F2DProbe.prototype.unhandledTypeWarning = function(inFunction, semanticType) {
    avp.logger.warn("Unhandled semantic type when probing F2d : " + semanticType + " in function " + inFunction);
};

F2DProbe.prototype.parseObject = function() {
    /*var semantic_type =*/ this.stream.getVarints();
    //debug("object parsing : type" + semantic_type);
};


F2DProbe.prototype.parseString = function() {
    var s = this.stream;
    s.getVarints();
    var len = s.getVarints();
    s.skipBytes(len);
};

F2DProbe.prototype.parsePoint = function() {
    this.stream.getVarints();
    this.parsePointPositions();
};

F2DProbe.prototype.parseVarintArray = function() {
    var s = this.stream;
    s.getVarints();

    var count = s.getVarints();
    for (var i = 0; i < count; ++i)
        s.getVarints();
};

F2DProbe.prototype.parseByteArray = function() {
    var s = this.stream;
    s.getVarints();
    var count = s.getVarints();
    s.skipBytes(count);
};

F2DProbe.prototype.parseEndOfObject = function() {
    var s = this.stream;
    s.getVarints();
    s.getVarints();
};

F2DProbe.prototype.parsePointsArray = function(context) {
    var s = this.stream;
    var sema = s.getVarints();
    var count = s.getVarints(); // number of coordinates * 2
    if (!count) return;
    count = count / 2;
    for (var i = 0; i < count; ++i)
        this.parsePointPositions();
};

F2DProbe.prototype.parsePoint = function(context) {
    var s = this.stream;
    var sema = s.getVarints();
    this.parsePointPositions();
};

F2DProbe.prototype.parseInt = function() {
    var s = this.stream;
    var sema = s.getVarints();

    switch (sema) {
        case F2dProbeSemanticType.st_color:
            s.skipUint32();
            break;
        case F2dProbeSemanticType.st_fill: {
            s.skipUint32();
            break;
        }
        default:
            s.skipUint32();
            this.unhandledTypeWarning('parseInt', sema);
            break;
    }
};

F2DProbe.prototype.parseVoid = function() {
    var sema = this.stream.getVarints();
    switch (sema) {
        case F2dProbeSemanticType.st_fill_off:
            break;
        default:
            this.unhandledTypeWarning('parseVoid', sema);
            break;
    }
};

F2DProbe.prototype.parseVarint = function() {
    this.stream.getVarints();
    this.stream.getVarints();
};

F2DProbe.prototype.parseIntArray = function() {
    var s = this.stream;
    s.getVarints();
    var count = s.getVarints();
    for (var i = 0; i < count; ++i)
        s.skipUint32();
};

F2DProbe.prototype.parseFloat = function() {
    var s = this.stream;
    s.getVarints();
    s.getFloat32();
};

F2DProbe.prototype.parseDoubleArray = function() {
    var s = this.stream;
    s.getVarints();
    var count = s.getVarints();
    for (var i = 0; i < count; ++i)
        s.skipFloat64();
};

F2DProbe.prototype.parseCircularArc = function() {
    var s = this.stream;
    s.getVarints();
    this.parsePointPositions();
    s.getVarints();
    s.getFloat32();
    s.getFloat32();
};

F2DProbe.prototype.parseCircle = function() {
    var s = this.stream;
    s.getVarints();
    this.parsePointPositions();
    s.getVarints();
};

F2DProbe.prototype.parseArc = function() {
    var s = this.stream;
    s.getVarints();
    this.parsePointPositions();
    s.getVarints();
    s.getVarints();
    s.getFloat32();
    s.getFloat32();
    s.getFloat32();
};

F2DProbe.prototype.parseDataType = function() {
    var data_type = this.stream.getVarints();

    switch (data_type) {
        case F2dProbeDataType.dt_void:
            this.parseVoid();
            break;
        case F2dProbeDataType.dt_int :
            this.parseInt();
            break;
        case F2dProbeDataType.dt_object :
            this.parseObject();
            break;
        case F2dProbeDataType.dt_varint :
            this.parseVarint();
            break;
        case F2dProbeDataType.dt_float :
            this.parseFloat();
            break;
        case F2dProbeDataType.dt_point_varint :
            this.parsePoint();
            break;
        case F2dProbeDataType.dt_point_varint_array :
            this.parsePointsArray();
            break;
        case F2dProbeDataType.dt_circular_arc :
            this.parseCircularArc();
            break;
        case F2dProbeDataType.dt_circle :
            this.parseCircle();
            break;
        case F2dProbeDataType.dt_arc :
            this.parseArc();
            break;
        case F2dProbeDataType.dt_varint_array:
            this.parseVarintArray();
            break;
        case F2dProbeDataType.dt_int_array:
            this.parseIntArray();
            break;
        case F2dProbeDataType.dt_byte_array:
            this.parseByteArray();
            break;
        case F2dProbeDataType.dt_string:
            this.parseString();
            break;
        case F2dProbeDataType.dt_double_array:
            this.parseDoubleArray();
            break;
        default:
            this.error = true;
            avp.logger.error("Bad op code encountered : " + data_type + " , bail out.");
            break;
    }

    if (!this.error)
        this.frameEnd = this.stream.offset;
};

F2DProbe.prototype.probe = function() {
    var stream = this.stream;
    var error = false;

    try {
        while (stream.offset < stream.byteLength) {
            this.parseDataType();
            if (this.error) {
                break;
            }
            this.opCount++;
        }
    } catch (exc) {
        // Typically caused by out of bounds access of data.
        var message = exc.toString();
        var stack = exc.stack ? exc.stack.toString() : "...";

        // Don't panic with this - we are supposed to hit out of bounds a couple of times when probing.
        //debug("Error in F2DProbe.prototype.probe : " + message + " with stack : " + stack);
    }
};

lmv.F2DProbe = F2DProbe;

})();
(function() {

"use strict";

var lmv = Autodesk.LMVTK;

// Similar as InputStream but with bounds checking.
// Throw exception when out of bounds access is / to be made.
function CheckedInputStream(buf) {
    this.buffer = buf;
    this.offset = 0;
    this.byteLength = buf.length;

    //We will use these shared memory arrays to
    //convert from bytes to the desired data type.
    this.convBuf = new ArrayBuffer(8);
    this.convUint8 = new Uint8Array(this.convBuf);
    this.convUint16 = new Uint16Array(this.convBuf);
    this.convInt32 = new Int32Array(this.convBuf);
    this.convUint32 = new Uint32Array(this.convBuf);
}

function OutOfBoundsBufferAccessException(offset) {
    this.offset = offset;
    this.message = "try to access an offset that is out of bounds: " + this.offset;
    this.toString = function() {
        return this.message;
    };
}

CheckedInputStream.prototype.boundsCheck = function(offset) {
    if (offset >= this.byteLength) {
        throw new OutOfBoundsBufferAccessException(offset);
    }
}

CheckedInputStream.prototype.seek = function(off) {
    this.boundsCheck(off);
    this.offset = off;
};

CheckedInputStream.prototype.getBytes = function(len) {
    this.boundsCheck(this.offset + len);
    var ret = new Uint8Array(this.buffer.buffer, this.offset, len);
    this.offset += len;
    return ret;
};

CheckedInputStream.prototype.skipBytes = function(len) {
    this.boundsCheck(this.offset + len);
    this.offset += len;
};


CheckedInputStream.prototype.getVarints = function () {
    var b;
    var value = 0;
    var shiftBy = 0;
    do {
        this.boundsCheck(this.offset);
        b = this.buffer[this.offset++];
        value |= (b & 0x7f) << shiftBy;
        shiftBy += 7;
    } while (b & 0x80);
    return value;
};

CheckedInputStream.prototype.getUint8 = function() {
    this.boundsCheck(this.offset + 1);
    return this.buffer[this.offset++];
};

CheckedInputStream.prototype.getUint16 = function() {
    this.boundsCheck(this.offset + 2);
    this.convUint8[0] = this.buffer[this.offset++];
    this.convUint8[1] = this.buffer[this.offset++];
    return this.convUint16[0];
};

CheckedInputStream.prototype.getInt16 = function() {
    var tmp = this.getUint16();
    //make negative integer if the ushort is negative
    if (tmp > 0x7fff)
        tmp = tmp | 0xffff0000;
    return tmp;
};

CheckedInputStream.prototype.getInt32 = function() {
    this.boundsCheck(this.offset + 4);
    var src = this.buffer;
    var dst = this.convUint8;
    var off = this.offset;
    dst[0] = src[off];
    dst[1] = src[off+1];
    dst[2] = src[off+2];
    dst[3] = src[off+3];
    this.offset += 4;
    return this.convInt32[0];
};

CheckedInputStream.prototype.getUint32 = function() {
    this.boundsCheck(this.offset + 4);
    var src = this.buffer;
    var dst = this.convUint8;
    var off = this.offset;
    dst[0] = src[off];
    dst[1] = src[off+1];
    dst[2] = src[off+2];
    dst[3] = src[off+3];
    this.offset += 4;
    return this.convUint32[0];
};

CheckedInputStream.prototype.skipUint32 = function() {
    this.boundsCheck(this.offset + 4);
    this.offset += 4;
};

CheckedInputStream.prototype.getFloat32 = function() {
    this.boundsCheck(this.offset + 4);
    this.offset += 4;
    return 0;
};

CheckedInputStream.prototype.getFloat64 = function() {
    this.boundsCheck(this.offset + 8);
    this.offset += 8;
    return 0;
};

CheckedInputStream.prototype.skipFloat64 = function() {
    this.boundsCheck(this.offset + 8);
    this.offset += 8;
};

CheckedInputStream.prototype.reset = function (buf) {
    this.buffer = buf;
    this.offset = 0;
    this.byteLength = buf.length;
};

lmv.CheckedInputStream = CheckedInputStream;

})();



Autodesk.LMVTK.GltfPackage = (function() {

var lmv = Autodesk.LMVTK;

/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */

  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  // Use a lookup table to find the index.
  var lookup = new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  var base64_encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  var base64_decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = lookup[base64.charCodeAt(i)];
      encoded2 = lookup[base64.charCodeAt(i+1)];
      encoded3 = lookup[base64.charCodeAt(i+2)];
      encoded4 = lookup[base64.charCodeAt(i+3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };


function blobToJson(blob) {

	var decodedString;

	if (typeof TextDecoder !== undefined) {
		decodedString = new TextDecoder("utf-8").decode(blob);
	}
	else {
		var encodedString = "";
		for (var i=0; i<blob.length; i++)
			encodedString += String.fromCharCode(blob[i]);

		decodedString = decodeURIComponent(escape(encodedString));
	}

	return JSON.parse(decodedString);
}


function Gltf(gltfJson) {

	this.loadedBuffers = {};

	//Check for binary glTF (glb)
	if (gltfJson instanceof ArrayBuffer) {
		var header = new Int32Array(gltfJson, 0, 20);
		if (header[0] !== 0x46546C67) //['g', 'l', 'T', 'F'] in little endian
			debug("glb header " + header[0]);
		var sceneLength = header[3];

		var sceneBlob = new Uint8Array(gltfJson, 20, sceneLength);

		//TODO: this is a bit lame, copies a large part of the ArrayBuffer,
		//but the geometry parsing logic is made much easier this way, without
		//having to keep track of a base offset to add when creating buffer views.
		var binary_glTF = gltfJson.slice(20 + sceneLength);

		this.loadedBuffers["KHR_binary_glTF"] = binary_glTF;
		gltfJson = blobToJson(sceneBlob);
	}

	this.gltf = gltfJson;
	//NOTE: We will map the Gltf contents to a structure similar
	//to an SVF package so that the rendering engine and viewer can work with it.

	this.manifest = null;

	this.metadata = this.gltf.asset || {}; //metadata json
	this.metadata.gltf = this.metadata.version || 1;

	this.materials = this.gltfMaterials = {
		name : "GLTF Materials",
		version : "1.0",
		scene : {
			"SceneUnit":"m"
		},
		materials: {}
	}; //The materials jsons from the GLTF, reindexed

	this.materialToIndex = {};
	this.materialList = [];

	this.geomToIndex = {};
	this.geomList = [];
	this.geomsLoaded = 0;

	this.fragments = {
		length : 0,
		numLoaded : 0,
		boxes : null,
		transforms : null,
		materials : null,

		fragId2dbId : null,
		entityIndexes : null,
		mesh2frag : {}
	};

	this.geompacks = [];

	this.instances = [];

	this.cameras = [];
	this.lights = [];

	this.bbox = null; //Overall scene bounds

	this.animations = null; // animations json

	this.pendingRequests = 0;

	this.globalOffset = { x: 0, y: 0, z: 0 };
	this.bbox = new LmvBox3();

	this.nodeToDbId = {};
	this.nextDbId = 1;
	this.nextFragId = 0;

}


var BASE64_PREFIX = "data:application/octet-stream;base64,";

//Lists all dependent files, so that their paths can be converted
//to e.g. signed links by the manifest interceptor before they are loaded.
Gltf.prototype.loadManifest = function(loadContext) {

	var manifestTemplate = {
		"name":	"LMV Manifest",
		"toolkitversion":	"LMVTK 2.6.4",
		"manifestversion":	2,
		"adskID":	{
			"sourceSystem":	"",
			"type":	"",
			"id":	"",
			"version":	""
		},
		"assets":	[],
		"typesets": []
	};

	this.manifest = manifestTemplate;

	var buffers = this.gltf.buffers;

	for (var bid in buffers) {

		//Is it the embedded glb buffer? Skip it, it needs no URI remapping.
		if (bid === "binary_glTF")
			continue;

		var buffer = buffers[bid];

		//Base64 embedded buffers, decode
		//and store in loaded buffers array.
		if (buffer.uri.indexOf(BASE64_PREFIX) === 0) {
			this.loadedBuffers[bid] = base64_decode(buffer.uri.slice(BASE64_PREFIX.length));
			buffer.uri = "embed://" + bid;
			continue;
		}

		var asset = {
			id : bid,
			URI : buffer.uri,
			uri: buffer.uri,
			usize : buffer.byteLength,
			type: buffer.type
		};

		this.manifest.assets.push(asset);
	}

	var images = this.gltf.images;

	for (var iid in images) {

		var image = images[iid];

		var asset = {
			id: iid,
			URI: image.uri,
			uri: image.uri,
			name: image.name,
			type: "image" //just so we can differentiate it from the geom buffers
		};

		this.manifest.assets.push(asset);
	}

	//TODO: Process any other externally referenced assets that we want to support

};


Gltf.prototype.loadRemainingSvf = function(loadContext) {

	//In case it was modified by the path interceptor
	if (loadContext.manifest)
		this.manifest = loadContext.manifest;

	//It's more convenient to find assets by their ids
	//when dealing with gltf.
	this.manifest.assetMap = {};
	for (var i=0; i<this.manifest.assets.length; i++) {
		var a = this.manifest.assets[i];
		this.manifest.assetMap[a.id] = a;
	}

	this.processMeshesList();
	this.processMaterialsList();

	this.deriveInstanceTree();

	loadContext.loadDoneCB("svf");

	//Call the callback for any buffers that were embedded in the gltf,
	//before loading the external ones.
	for (var b in this.loadedBuffers) {
		this.loadGeometry(loadContext, b);
	}

	this.loadBuffers(loadContext);

};

Gltf.prototype.loadBuffers = function(loadContext) {

	//Launch an XHR to load the data from external file
	var svf = this;

	var bufList = [];
	var assets = this.manifest.assets;
	for (var i=0; i<assets.length; i++) {
		if (assets[i].type !== "image")
			bufList.push(assets[i]);
	}

	var currentRequest = -1;

	function xhrCB(responseData) {

		if (currentRequest < bufList.length-1) {
			var nextBuf = bufList[currentRequest+1];

            var options = {
                responseType: nextBuf.type || 'arraybuffer'
            };

			avp.ViewingService.getItem(
                loadContext,
                loadContext.basePath + nextBuf.URI,
                xhrCB,
                loadContext.onFailureCallback,
                options
            );
		}

		if (responseData) {
			var curBuf = bufList[currentRequest];
			svf.loadedBuffers[curBuf.id] = responseData.buffer; //Get the ArrayBuffer out of the Uint8Array returned by the ViewingService.getItem
			svf.loadGeometry(loadContext, curBuf.id);
		}

		currentRequest++;

	}

	xhrCB(null);

};

var COMPONENT_TO_BYTES = {
	"5120" : 1, //BYTE
	"5121" : 1, //UNSIGNED_BYTE
	"5122" : 2, //SHORT
	"5123" : 2, //UNSIGNED_SHORT
	"5126" : 4  //FLOAT
};

var TYPE_TO_SIZE = {
	"SCALAR" : 1,
	"VEC2" : 2,
	"VEC3": 3,
	"VEC4": 4
};

//Constructs all meshes that use the buffer
//that was just loaded
//NOTE: This loader pulls out all attributes for a mesh from a possibly
//large shared buffer and interleaves them into a per-mesh vertex buffer
//for each mesh. This fits better with the architecture of the LMV renderer
//right now. But, in the future, things could be refactored so that the GL
//buffers are managed separately from the meshes, and the meshes are pointing
//into larger shared buffers.
Gltf.prototype.loadGeometry = function(loadContext, bufferId) {

	var buffer = this.gltf.buffers[bufferId];
	var meshIds = buffer.meshes;
	var scope = this;

	function checkIfBufferAvailable(accessorId) {
		var accessor = scope.gltf.accessors[accessorId];
		var bvId = accessor.bufferView;
		if (bvId) {
			var bufferId = scope.gltf.bufferViews[bvId].buffer;
			if (bufferId) {
				return !!scope.loadedBuffers[bufferId];
			}
		}
		return false;
	}

	for (var meshIdx=0; meshIdx<meshIds.length; meshIdx++) {

		var mesh = this.gltf.meshes[meshIds[meshIdx]];
		var prims = mesh.primitives;

		var usePackedNormals = true;

		for (var primIdx=0; primIdx<prims.length; primIdx++) {

			var prim = prims[primIdx];

			var mesh = {
				vblayout : {},
				vbstride : 0,
				packedNormals : usePackedNormals
			};

			var canLoad = true;
			if (prim.indices) {
				canLoad = canLoad && checkIfBufferAvailable(prim.indices);
				if (canLoad) {
					var inds = scope.gltf.accessors[prim.indices];
					mesh.triangleCount = inds.count / 3;
					var stride = inds.byteStride;
					var componentSize = 2;

					var bv = scope.gltf.bufferViews[inds.bufferView];
					var byteOffset = inds.byteOffset + bv.byteOffset;
					var buffer = scope.loadedBuffers[bv.buffer];
					var src, dst;

					if (inds.componentType === 5123) {
						dst = mesh.indices = new Uint16Array(inds.count);
						componentSize = 2;
						src = new Uint16Array(buffer);
					}
					else
						debug("Unimplemented component type for index buffer");

					var srcOffset = byteOffset / componentSize;

					if (stride === 0)
						stride = 1;
					else
						stride /= componentSize;

					for (var i=0; i<inds.count; i++) {
						dst[i] = src[srcOffset + i * stride];
					}
				}
			}

			var offset = 0;
			for (var a in prim.attributes) {
				canLoad = canLoad && checkIfBufferAvailable(prim.attributes[a]);
				var attr = scope.gltf.accessors[prim.attributes[a]];

				if (canLoad) {
					if (a === "NORMAL") {
						mesh.vbstride += usePackedNormals ? 1 : 3;

						mesh.vblayout['normal'] = { offset : offset,
													itemSize : usePackedNormals ? 2 : 3,
													bytesPerItem: usePackedNormals ? 2 : 4,
													normalize: usePackedNormals };

						offset += usePackedNormals ? 1 : 3;

					}
					else {
						var attrName = a;

						if (a === "POSITION") {
							attrName = "position";
							mesh.vertexCount = attr.count;
						} else if (a.indexOf("TEXCOORD") === 0) {
							var uvIdx = parseInt(a.split("_")[1]);
							attrName = "uv" + (uvIdx || "");
						} else if (a.indexOf("COLOR") === 0) {
							attrName = "color";
						}

						var byteSize = COMPONENT_TO_BYTES[attr.componentType] * TYPE_TO_SIZE[attr.type];
						mesh.vbstride += byteSize / 4;

						mesh.vblayout[attrName] = { offset : offset,
													itemSize : TYPE_TO_SIZE[attr.type],
													bytesPerItem : COMPONENT_TO_BYTES[attr.componentType],
													normalize : false
												};

						offset += byteSize / 4;
					}
				}

			}

			//Now that we know how big of a vertex buffer we need, make one, and
			//go over the attributes again to copy their data from the glTF buffer
			//into the mesh vertex buffer
			if (canLoad) {
				var vbf = mesh.vb = new Float32Array(mesh.vertexCount * mesh.vbstride);
				//See if we want to pack the normals into two shorts
				var vbi;
				if (usePackedNormals)
					vbi = new Uint16Array(mesh.vb.buffer);

				for (var a in prim.attributes) {
					var attr = scope.gltf.accessors[prim.attributes[a]];
					var bv = scope.gltf.bufferViews[attr.bufferView];
					var byteOffset = attr.byteOffset + bv.byteOffset;
					var rawbuffer = scope.loadedBuffers[bv.buffer];

					if (a === "NORMAL") {
						var lmvAttr = mesh.vblayout["normal"];

						if (attr.count != mesh.vertexCount)
							debug("Normals count does not equal vertex count");

						//TODO: assumption that they're all floats...
						var src = new Float32Array(rawbuffer);
						var srcIdx = byteOffset / 4;
						var offset = lmvAttr.offset;

						for (var i=0; i<mesh.vertexCount; i++, offset += mesh.vbstride) {
							var nx = src[srcIdx];
							var ny = src[srcIdx+1];
							var nz = src[srcIdx+2];

							if (vbi) {
								var pnx = (Math.atan2(ny, nx) / Math.PI + 1.0) * 0.5;
								var pny = (nz + 1.0) * 0.5;

								vbi[offset*2] = (pnx * 65535)|0;
								vbi[offset*2+1] = (pny * 65535)|0;
							} else {
								vbf[offset] = nx;
								vbf[offset+1] = ny;
								vbf[offset+2] = nz;
							}

							srcIdx += attr.byteStride / 4;
						}
					}
					else {
						var attrName = a;

						//Map common attribute names to ones used by LMV
						if (a === "POSITION") {
							attrName = "position";
							mesh.vertexCount = attr.count;
						} else if (a.indexOf("TEXCOORD") === 0) {
							var uvIdx = parseInt(a.split("_")[1]);
							attrName = "uv" + (uvIdx || "");
						} else if (a.indexOf("COLOR") === 0) {
							attrName = "color";
						}

						var lmvAttr = mesh.vblayout[attrName];

						//TODO: assumption that they're all floats, might be wrong for COLOR
						if (COMPONENT_TO_BYTES[attr.componentType] !== 4)
							debug("Unimplemented size for vertex attribute.");
						var src = new Float32Array(rawbuffer);
						var srcIdx = byteOffset / 4;
						var offset = lmvAttr.offset;
						for (var i=0; i<mesh.vertexCount; i++, offset += mesh.vbstride) {

							for (var j=0; j<lmvAttr.itemSize; j++) {
								vbf[offset+j] = src[srcIdx+j];
							}

							srcIdx += attr.byteStride / 4;
						}
					}

					//If all meshes using this buffer are successfully loaded,
					//free its array buffer from memory.
					var gltfBuffer = scope.gltf.buffers[bv.buffer];
					gltfBuffer.refCount--;
					if (gltfBuffer.refCount === 0) {
						delete scope.loadedBuffers[bv.buffer];
					}
				}

				//Mesh is complete.
				scope.geomsLoaded++;

				lmv.VBUtils.computeBounds3D(mesh);

				loadContext.loadDoneCB("mesh", { mesh: mesh,

												//Set these so that when SvfLoader adds them together
												//it comes up with the IDs we use in the meshToFrag map.
												packId : meshIds[meshIdx],
												meshIndex: primIdx,

												progress: scope.geomsLoaded / scope.geomList.length });
			}
		}

	}

	buffer.meshes = null;

};

//Converts materials to indexed list, for use in
//the fragment list material indices array
Gltf.prototype.processMaterialsList = function() {

	var mats = this.gltf.materials;

	for (var m in mats) {
		var idx = this.materialList.length;
		this.materialToIndex[m] = idx;
		this.gltfMaterials.materials[idx] = mats[m];
		this.materialList.push(m);
	}

};

Gltf.prototype.processMeshesList = function() {

	var meshes = this.gltf.meshes;
	var scope = this;

	function processAccessor(accessorId) {
		var accessor = scope.gltf.accessors[accessorId];
		var bvId = accessor.bufferView;
		if (bvId) {
			var bufferId = scope.gltf.bufferViews[bvId].buffer;
			if (bufferId) {
				var buffer = scope.gltf.buffers[bufferId];

				//Keep track of how many buffer views are using this buffer.
				//Once we load all of them, we will free it from memory
				if (!buffer.refCount)
					buffer.refCount = 1;
				else
					buffer.refCount++;

				//Keep track of meshes using a buffer. We will load those
				//in a batch once a buffer file is loaded.
				if (!buffer.meshes)
					buffer.meshes = [];

				if (!addedToBuffer) {
					buffer.meshes.push(m);
					addedToBuffer = true;
				}
			}
		}
	}

	for (var m in meshes) {
		var mesh = meshes[m];
		var addedToBuffer = false;
		for (var k=0; k<mesh.primitives.length; k++) {
			var entityId = m + ":" + k;
			this.geomToIndex[entityId] = this.geomList.length;
			this.geomList.push(entityId);

			var prim = mesh.primitives[k];

			if (prim.indices) {
				processAccessor(prim.indices);
			}

			for (var a in prim.attributes) {
				processAccessor(prim.attributes[a]);
			}
		}
	}
};


//Pre-traversal of the node hierarchy to count how many fragments we will
//need in the LMV fragment list
Gltf.prototype.countFragments = function() {

	var sceneName = this.gltf.scene;
	var gltfRoot = this.gltf.scenes[sceneName];
	var gltfNodes = this.gltf.nodes;

	var numFrags = 0;

	var scope = this;

	function traverseNodes(gltfNode) {

		var meshes = gltfNode.meshes;
		if (gltfNode.meshes) {
			for ( var j=0; j<meshes.length; j++) {
				var prims = scope.gltf.meshes[meshes[j]].primitives;
				for (var k=0; k<prims.length; k++) {
					numFrags++;
				}
			}
		}

		var children = gltfNode.children || gltfNode.nodes; //the root scene uses "nodes" instead of "children"
		if ( children) {
			for (var i=0; i<children.length; i++) {
				var gltfChild = gltfNodes[children[i]];
				traverseNodes(gltfChild);
			}
		}
	}

	traverseNodes(gltfRoot);

	this.fragments.length = numFrags;
	this.fragments.boxes =                 new Float32Array(6*numFrags);
	this.fragments.transforms =            new Float32Array(12*numFrags);
	this.fragments.materials =             new Int32Array(numFrags);
	this.fragments.entityIndexes =         new Int32Array(numFrags);
	this.fragments.fragId2dbId =           new Int32Array(numFrags);
	this.fragments.packIds =               new Int32Array(numFrags); //TODO: not used for gltf

};

//Create an instance tree similar to the one
//that SVF gets from the property db
Gltf.prototype.deriveInstanceTree = function() {

	this.countFragments();

	var sceneName = this.gltf.scene;
	var gltfRoot = this.gltf.scenes[sceneName];
	var gltfNodes = this.gltf.nodes;

	this.instanceTree = {
		name: sceneName,
		dbId: this.nextDbId++,
		children : []
	};
	this.nodeToDbId[sceneName] = this.instanceTree.dbId;

	var nodeBoxes = [];
	var maxDepth = 1;

	var scope = this;
	var fragments = this.fragments;
	var tmpBox = new LmvBox3();

	function traverseNodes(svfNode, gltfNode, worldTransform, depth) {

		if (depth > maxDepth)
			maxDepth = depth;

		var currentTransform = worldTransform.clone();

		if (gltfNode.matrix) {
			var mtx = new LmvMatrix4(true);
			mtx.fromArray(gltfNode.matrix);
			currentTransform.multiply(mtx);
		}

		var nodeBox = new LmvBox3();

		var meshes = gltfNode.meshes;
		if (gltfNode.meshes) {
			svfNode.fragIds = [];
			for ( var j=0; j<meshes.length; j++) {
				var prims = scope.gltf.meshes[meshes[j]].primitives;
				for (var k=0; k<prims.length; k++) {

					var entityId = meshes[j] + ":" + k;
					var fragId = scope.nextFragId++;

					svfNode.fragIds.push(fragId);

					fragments.fragId2dbId[fragId] = svfNode.dbId;

					fragments.entityIndexes[fragId] = scope.geomToIndex[entityId];

					if (!fragments.mesh2frag[entityId])
						fragments.mesh2frag[entityId] = [fragId];
					else
						fragments.mesh2frag[entityId].push(fragId);

					fragments.materials[fragId] = scope.materialToIndex[prims[k].material];

					// Copy the transform to the fraglist array
					var off = fragId * 12;
					var cur = currentTransform.elements;
					var orig = fragments.transforms;
					orig[off] = cur[0];
					orig[off + 1] = cur[1];
					orig[off + 2] = cur[2];
					orig[off + 3] = cur[4];
					orig[off + 4] = cur[5];
					orig[off + 5] = cur[6];
					orig[off + 6] = cur[8];
					orig[off + 7] = cur[9];
					orig[off + 8] = cur[10];
					orig[off + 9] = cur[12];
					orig[off + 10] = cur[13];
					orig[off + 11] = cur[14];

					var posAccessorId = prims[k].attributes["POSITION"];
					if (posAccessorId) {
						var accessor = scope.gltf.accessors[posAccessorId];
						if (accessor.min && accessor.max) {
							tmpBox.min.x = accessor.min[0];
							tmpBox.min.y = accessor.min[1];
							tmpBox.min.z = accessor.min[2];
							tmpBox.max.x = accessor.max[0];
							tmpBox.max.y = accessor.max[1];
							tmpBox.max.z = accessor.max[2];

							tmpBox.applyMatrix4(currentTransform);

							off = fragId * 6;
							var dst = fragments.boxes;
							dst[off] =   tmpBox.min.x;
							dst[off+1] = tmpBox.min.y;
							dst[off+2] = tmpBox.min.z;

							dst[off+3] = tmpBox.max.x;
							dst[off+4] = tmpBox.max.y;
							dst[off+5] = tmpBox.max.z;

							nodeBox.union(tmpBox);
						} else {
							debug("unknown bbox for mesh", meshes[j]);
						}
					}
				}
			}
		}

		var children = gltfNode.children || gltfNode.nodes; //the root scene uses "nodes" instead of "children"
		if ( children) {
			svfNode.children = [];
			for (var i=0; i<children.length; i++) {
				var gltfChild = gltfNodes[children[i]];

				var svfChild = {
					name: gltfChild.name || children[i],
					dbId: scope.nextDbId++
				};

				scope.nodeToDbId[children[i]] = svfChild.dbId;

				svfNode.children.push(svfChild);

				var childBox = traverseNodes(svfChild, gltfChild, currentTransform, depth+1);
				nodeBox.union(childBox);
			}
		}

		var boxOffset = svfNode.dbId * 6;
		var dst = nodeBoxes;
		dst[boxOffset] = nodeBox.min.x;
		dst[boxOffset+1] = nodeBox.min.y;
		dst[boxOffset+2] = nodeBox.min.z;
		dst[boxOffset+3] = nodeBox.max.x;
		dst[boxOffset+4] = nodeBox.max.y;
		dst[boxOffset+5] = nodeBox.max.z;

		return nodeBox;
	}

	var rootBox = traverseNodes(this.instanceTree, gltfRoot, new LmvMatrix4(true), 1);
	scope.bbox.union(rootBox);

	//convert boxes to typed array now that we know the needed size
	this.instanceBoxes = new Float32Array(nodeBoxes.length);
	this.instanceBoxes.set(nodeBoxes);
	this.objectCount = this.nextDbId;
	this.maxTreeDepth = maxDepth;
};



return Gltf;

})();


//Implements runtime flat array storage for the node tree encoded by the property database
(function() {

"use strict";

var av = Autodesk.Viewing,
    avp = av.Private;
	
	//
	// struct Node {
	//     int dbId;
	//	   int parentDbId;
	//	   int firstChild; //if negative it's a fragment list
	//     int numChildren;
	//     int flags;	
	// };
	// sizeof(Node) == 20
	var SIZEOF_NODE = 5, //integers
		OFFSET_DBID = 0,
		OFFSET_PARENT = 1,
		OFFSET_FIRST_CHILD = 2,
		OFFSET_NUM_CHILD = 3,
		OFFSET_FLAGS = 4;

	// note: objectCount and fragmentCount are not used
	function NodeArray(objectCount, fragmentCount) {

		this.nodes = [];
		this.nextNode = 0;
		
		this.children = [];
		this.nextChild = 0;

		this.dbIdToIndex = {};

		this.names = [];
		this.s2i = {}; //duplicate string pool
		this.strings = [];
		this.nameSuffixes = []; //integers

		//Occupy index zero so that we can use index 0 as undefined
		this.getIndex(0);
	}

	NodeArray.prototype.getIndex = function(dbId) {

		var index = this.dbIdToIndex[dbId];

		if (index)
			return index;

		index = this.nextNode++;

		//Allocate space for new node
		this.nodes.push(dbId); //store the dbId as first integer in the Node structure
		//Add four blank integers to be filled by setNode
		for (var i=1; i<SIZEOF_NODE; i++)
			this.nodes.push(0);

		this.dbIdToIndex[dbId] = index;

		return index;
	};

	NodeArray.prototype.setNode = function(dbId, parentDbId, name, flags, childrenIds, isLeaf) {

		var index = this.getIndex(dbId);

		var baseOffset = index * SIZEOF_NODE;

		this.nodes[baseOffset+OFFSET_PARENT] = parentDbId;
		this.nodes[baseOffset+OFFSET_FIRST_CHILD] = this.nextChild;
		this.nodes[baseOffset+OFFSET_NUM_CHILD] = isLeaf ? -childrenIds.length : childrenIds.length;
		this.nodes[baseOffset+OFFSET_FLAGS] = flags;

		for (var i=0; i<childrenIds.length; i++)
			this.children[this.nextChild++] = isLeaf ? childrenIds[i] : this.getIndex(childrenIds[i]);

		if (this.nextChild > this.children.length)
			avp.logger.error("Child index out of bounds -- should not happen");
	
		this.processName(index, name);
	};

	NodeArray.prototype.processName = function(index, name) {

		//Attempt to decompose the name into a base string + integer,
		//like for example "Base Wall [12345678]" or "Crank Shaft:1"
		//We will try to reduce memory usage by storing "Base Wall" just once.
		var base;
		var suffix;

		//Try Revit style [1234] first
		var iStart = -1;
		var iEnd = -1;

		if (name) { //name should not be empty, but hey, it happens.
			iEnd = name.lastIndexOf("]");
			iStart = name.lastIndexOf("[");

			//Try Inventor style :1234
			if (iStart === -1 || iEnd === -1) {
				iStart = name.lastIndexOf(":");
				iEnd = name.length;
			}		
		}

		//TODO: Any other separators? What does AutoCAD use?

		if (iStart >= 0 && iEnd > iStart) {
			base = name.slice(0, iStart+1);
			var ssuffix = name.slice(iStart+1, iEnd);
			suffix = parseInt(ssuffix, 10);
			
			//make sure we get the same thing back when
			//converting back to string, otherwise don't 
			//decompose it.
			if (!suffix || suffix+"" !== ssuffix) {
				base = name;
				suffix = 0;
			}
		} else {
			base = name;
			suffix = 0;
		}


		var idx = this.s2i[base];
		if (idx === undefined) {
			this.strings.push(base);
			idx = this.strings.length-1;
			this.s2i[base] = idx;
		}

		this.names[index] = idx;
		this.nameSuffixes[index] = suffix;
	};


	function arrayToBuffer(a) {
		var b = new Int32Array(a.length);
		b.set(a);
		return b;
	}

    // note none of these arguments are used
	NodeArray.prototype.flatten = function(dbId, parentDbId, name, flags, childrenIds, isLeaf) {
		this.nodes = arrayToBuffer(this.nodes);
		this.children = arrayToBuffer(this.children);
		this.names = arrayToBuffer(this.names);
		this.nameSuffixes = arrayToBuffer(this.nameSuffixes);
		this.s2i = null; //we don't need this temporary map once we've built the strings list
	};



	function InstanceTreeAccess(nodeArray, rootId, nodeBoxes) {
		this.nodes = nodeArray.nodes;
		this.children = nodeArray.children;
		this.dbIdToIndex = nodeArray.dbIdToIndex;
		this.names = nodeArray.names;
		this.nameSuffixes = nodeArray.nameSuffixes;
		this.strings = nodeArray.strings;
		this.rootId = rootId;
		this.numNodes = this.nodes.length / SIZEOF_NODE;
		this.visibleIds = null;


		this.nodeBoxes = nodeBoxes || new Float32Array(6 * this.numNodes);
	}

    // note dbId is not used
	InstanceTreeAccess.prototype.getNumNodes = function(dbId) {
		return this.numNodes;
	};

	InstanceTreeAccess.prototype.getIndex = function(dbId) {
		return this.dbIdToIndex[dbId];
	};

	InstanceTreeAccess.prototype.name = function(dbId) {
		var idx = this.dbIdToIndex[dbId];
		var base = this.strings[this.names[idx]];
		var suffix = this.nameSuffixes[idx];
		if (suffix) {
			//NOTE: update this logic if more separators are supported in processName above
			var lastChar = base.charAt(base.length-1);
			if (lastChar === "[")
				return base + suffix + "]";
			else
				return base + suffix;
		} else {
			return base;
		}
	};

	InstanceTreeAccess.prototype.getParentId = function(dbId) {
		return this.nodes[this.dbIdToIndex[dbId] * SIZEOF_NODE + OFFSET_PARENT];
	};

	InstanceTreeAccess.prototype.getNodeFlags = function(dbId) {
		return this.nodes[this.dbIdToIndex[dbId] * SIZEOF_NODE + OFFSET_FLAGS];
	};

	InstanceTreeAccess.prototype.setNodeFlags = function(dbId, flags) {
		this.nodes[this.dbIdToIndex[dbId] * SIZEOF_NODE + OFFSET_FLAGS] = flags;
	};

	InstanceTreeAccess.prototype.getNumChildren = function(dbId) {
		var numChildren = this.nodes[this.dbIdToIndex[dbId] * SIZEOF_NODE + OFFSET_NUM_CHILD];
		if (numChildren > 0)
			return numChildren;
		return 0;		
	};

	InstanceTreeAccess.prototype.getNumFragments = function(dbId) {
		var numChildren = this.nodes[this.dbIdToIndex[dbId] * SIZEOF_NODE + OFFSET_NUM_CHILD];
		if (numChildren < 0)
			return -numChildren;
		return 0;		
	};

	InstanceTreeAccess.prototype.getNodeBox = function(dbId, dst) {
		var off = this.getIndex(dbId) * 6;
		for (var i=0; i<6; i++)
			dst[i] = this.nodeBoxes[off+i];
	};

	//Returns an array containing the dbIds of all objects
	//that are physically represented in the scene. Not all
	//objects in the property database occur physically in each graphics viewable.
	InstanceTreeAccess.prototype.getVisibleIds = function() {
		if (!this.visibleIds) {
			this.visibleIds = Object.keys(this.dbIdToIndex).map(function(k) { return parseInt(k); });
		}

		return this.visibleIds;
	};


	InstanceTreeAccess.prototype.enumNodeChildren = function(dbId, callback) {
		var idx = this.dbIdToIndex[dbId];
		var firstChild = this.nodes[idx * SIZEOF_NODE + OFFSET_FIRST_CHILD];
		var numChildren = this.nodes[idx * SIZEOF_NODE + OFFSET_NUM_CHILD];

		if (numChildren > 0) {
			for (var i=0; i<numChildren; i++) {
				var childDbId = this.nodes[this.children[firstChild+i] * SIZEOF_NODE];
				callback(childDbId, dbId, idx);
			}
		}
	};

	InstanceTreeAccess.prototype.enumNodeFragments = function(dbId, callback) {
		var idx = this.dbIdToIndex[dbId];
		var firstChild = this.nodes[idx * SIZEOF_NODE + OFFSET_FIRST_CHILD];
		var numChildren = this.nodes[idx * SIZEOF_NODE + OFFSET_NUM_CHILD];

		//If numChildren is negative, it means leaf node and children are fragments
		if (numChildren < 0) {
			numChildren = -numChildren;
			for (var i=0; i<numChildren; i++) {
				callback(this.children[firstChild+i], dbId, idx);
			}
		}
	};

	avp.InstanceTreeStorage = NodeArray;
	avp.InstanceTreeAccess = InstanceTreeAccess;


})();

(function() {

"use strict";

var av = Autodesk.Viewing,
    avp = av.Private;


/**
 * BVH definitions:
 *
 * BVH Node: if this was C (the only real programming language), it would go something like this,
 * but with better alignment.
 *
 * This is definition for "fat" nodes (for rasterization),
 * i.e. when inner nodes also contain primitives.
 * struct Node {                                                            byte/short/int offset
 *      float worldBox[6]; //world box of the node node                         0/0/0
 *      int leftChildIndex; //pointer to left child node (right is left+1)     24/12/6
 *      ushort primCount; //how many fragments are at this node                28/14/7
 *      ushort flags; //bitfield of good stuff                                 30/15/7.5
 *
 *      int primStart; //start of node's own primitives (fragments) list       32/16/8
 * };
 * => sizeof(Node) = 36 bytes

 * Definition for lean nodes (for ray casting): when a node is either inner node (just children, no primitives)
 * or leaf (just primitives, no children).
 * struct Node {
 *      float worldBox[6]; //world box of the node node
 *      union {
 *          int leftChildIndex; //pointer to left child node (right is left+1)
 *          int primStart; //start of node's own primitives (fragments) list
 *      };
 *      ushort primCount; //how many fragments are at this node
 *      ushort flags; //bitfield of good stuff
 * };
 * => sizeof(Node) = 32 bytes
 *
 * The class below encapsulates an array of such nodes using ArrayBuffer as backing store.
 *
 * @param {ArrayBuffer|number} initialData  Initial content of the NodeArray, or initial allocation of empty nodes
 * @param {boolean} useLeanNode Use minimal node structure size. Currently this parameter must be set to false.
 */
function NodeArray(initialData, useLeanNode) {
    'use strict';

    if (useLeanNode) {
        this.bytes_per_node = 32;
    } else {
        this.bytes_per_node = 36;
    }

    var initialCount;
    var initialBuffer;

    if (initialData instanceof ArrayBuffer) {
        initialCount = initialData.byteLength / this.bytes_per_node;
        initialBuffer = initialData;
        this.nodeCount = initialCount;
    }
    else {
        initialCount = initialData | 0;
        initialBuffer =  new ArrayBuffer(this.bytes_per_node * initialCount);
        this.nodeCount = 0;
    }

    this.nodeCapacity = initialCount;
    this.nodesRaw = initialBuffer;

    this.is_lean_node = useLeanNode;
    this.node_stride = this.bytes_per_node  / 4;
    this.node_stride_short = this.bytes_per_node / 2;

    //Allocate memory buffer for all tree nodes
    this.nodesF = new Float32Array(this.nodesRaw);
    this.nodesI = new Int32Array(this.nodesRaw);
    this.nodesS = new Uint16Array(this.nodesRaw);
}

NodeArray.prototype.setLeftChild = function(nodeidx, childidx) {
    this.nodesI[nodeidx * this.node_stride + 6] = childidx;
};
NodeArray.prototype.getLeftChild = function(nodeidx) {
    return this.nodesI[nodeidx * this.node_stride + 6];
};

NodeArray.prototype.setPrimStart = function(nodeidx, start) {
    if (this.is_lean_node)
        this.nodesI[nodeidx * this.node_stride + 6] = start;
    else
        this.nodesI[nodeidx * this.node_stride + 8] = start;
};
NodeArray.prototype.getPrimStart = function(nodeidx) {
    if (this.is_lean_node)
        return this.nodesI[nodeidx * this.node_stride + 6];
    else
        return this.nodesI[nodeidx * this.node_stride + 8];
};

NodeArray.prototype.setPrimCount = function(nodeidx, count) {
    this.nodesS[nodeidx * this.node_stride_short + 14] = count;
};
NodeArray.prototype.getPrimCount = function(nodeidx) {
    return this.nodesS[nodeidx * this.node_stride_short + 14];
};

NodeArray.prototype.setFlags = function(nodeidx, axis, isFirst, isTransparent) {
    this.nodesS[nodeidx * this.node_stride_short + 15] = (isTransparent << 3) | (isFirst << 2) | (axis & 0x3);
};
NodeArray.prototype.getFlags = function(nodeidx) {
    return this.nodesS[nodeidx * this.node_stride_short + 15];
};

NodeArray.prototype.setBox0 = function(nodeidx, src) {
    var off = nodeidx * this.node_stride;
    var dst = this.nodesF;
    dst[off] = src[0];
    dst[off+1] = src[1];
    dst[off+2] = src[2];
    dst[off+3] = src[3];
    dst[off+4] = src[4];
    dst[off+5] = src[5];
};
NodeArray.prototype.getBoxThree = function(nodeidx, dst) {
    var off = nodeidx * this.node_stride;
    var src = this.nodesF;
    dst.min.x = src[off];
    dst.min.y = src[off+1];
    dst.min.z = src[off+2];
    dst.max.x = src[off+3];
    dst.max.y = src[off+4];
    dst.max.z = src[off+5];
};
NodeArray.prototype.setBoxThree = function(nodeidx, src) {
    var off = nodeidx * this.node_stride;
    var dst = this.nodesF;
    dst[off] = src.min.x;
    dst[off+1] = src.min.y;
    dst[off+2] = src.min.z;
    dst[off+3] = src.max.x;
    dst[off+4] = src.max.y;
    dst[off+5] = src.max.z;
};




NodeArray.prototype.makeEmpty = function(nodeidx) {

    var off = nodeidx * this.node_stride;
    var dst = this.nodesI;

    //No point to makeEmpty here, because the box gets set
    //directly when the node is initialized in bvh_subdivide.
    //box_make_empty(this.nodesF, off);

    //_this.setLeftChild(nodeidx,-1);
    dst[off + 6] = -1;

    //both prim count and flags to 0
    dst[off + 7] = 0;

    //_this.setPrimStart(nodeidx, -1);
    if (!this.is_lean_node)
        dst[off + 8] = -1;

};

NodeArray.prototype.realloc = function(extraSize) {
    if (this.nodeCount + extraSize > this.nodeCapacity) {
        var nsz = 0 | (this.nodeCapacity * 3 / 2);
        if (nsz < this.nodeCount + extraSize)
            nsz = this.nodeCount + extraSize;

        var nnodes = new ArrayBuffer(nsz * this.bytes_per_node);
        var nnodesI = new Int32Array(nnodes);
        nnodesI.set(this.nodesI);

        this.nodeCapacity = nsz;
        this.nodesRaw = nnodes;
        this.nodesF = new Float32Array(nnodes);
        this.nodesI = nnodesI;
        this.nodesS = new Uint16Array(nnodes);
    }
};

NodeArray.prototype.nextNodes = function(howMany) {

    this.realloc(howMany);

    var res = this.nodeCount;
    this.nodeCount += howMany;

    for (var i=0; i<howMany; i++) {
        this.makeEmpty(res+i);
    }

    return res;
};

NodeArray.prototype.getRawData = function() {
    return this.nodesRaw.slice(0, this.nodeCount * this.bytes_per_node);
};

var BOX_STRIDE = 6;
var POINT_STRIDE = 3;
var BOX_EPSILON = 1e-5;
var BOX_SCALE_EPSILON = 1e-5;
var MAX_DEPTH = 15; /* max tree depth */
var MAX_BINS = 16;

/**
* Bounding Volume Hierarchy build algorithm.
* Uses top down binning -- see "On fast Construction of SAH-based Bounding Volume Hierarchies" by I.Wald
* Ported from the C version here: https://git.autodesk.com/stanevt/t-ray/blob/master/render3d/t-ray/t-core/t-bvh.c
* Optimized for JavaScript.
*/
var BVHModule = function() {
    //There be dragons in this closure.

"use strict";


/**
 * Utilities for manipulating bounding boxes stored
 * in external array (as sextuplets of float32)
 */


function box_get_centroid(dst, dst_off, src, src_off) {
    dst[dst_off] = 0.5*(src[src_off] + src[src_off + 3]);
    dst[dst_off+1] = 0.5*(src[src_off + 1] + src[src_off + 4]);
    dst[dst_off+2] = 0.5*(src[src_off + 2] + src[src_off + 5]);
}

function box_add_point_0(dst, src, src_off) {

    if (dst[0] > src[src_off])   dst[0] = src[src_off];
    if (dst[3] < src[src_off])   dst[3] = src[src_off];

    if (dst[1] > src[src_off+1]) dst[1] = src[src_off+1];
    if (dst[4] < src[src_off+1]) dst[4] = src[src_off+1];

    if (dst[2] > src[src_off+2]) dst[2] = src[src_off+2];
    if (dst[5] < src[src_off+2]) dst[5] = src[src_off+2];

}

function box_add_box_0(dst, src, src_off) {

    if (dst[0] > src[src_off]) dst[0] = src[src_off];
    if (dst[1] > src[src_off+1]) dst[1] = src[src_off+1];
    if (dst[2] > src[src_off+2]) dst[2] = src[src_off+2];

    if (dst[3] < src[src_off+3]) dst[3] = src[src_off+3];
    if (dst[4] < src[src_off+4]) dst[4] = src[src_off+4];
    if (dst[5] < src[src_off+5]) dst[5] = src[src_off+5];
}

function box_add_box_00(dst, src) {
    if (dst[0] > src[0]) dst[0] = src[0];
    if (dst[1] > src[1]) dst[1] = src[1];
    if (dst[2] > src[2]) dst[2] = src[2];

    if (dst[3] < src[3]) dst[3] = src[3];
    if (dst[4] < src[4]) dst[4] = src[4];
    if (dst[5] < src[5]) dst[5] = src[5];
}

function box_get_size(dst, dst_off, src, src_off) {
    for (var i=0; i<3; i++) {
        dst[dst_off+i] = src[src_off+3+i] - src[src_off+i];
    }
}

//function box_copy(dst, dst_off, src, src_off) {
//    for (var i=0; i<6; i++) {
//        dst[dst_off+i] = src[src_off+i];
//    }
//}

// unwound version of box_copy
function box_copy_00(dst, src) {
    dst[0] = src[0];
    dst[1] = src[1];
    dst[2] = src[2];
    dst[3] = src[3];
    dst[4] = src[4];
    dst[5] = src[5];
}

var dbl_max = Infinity;

//function box_make_empty(dst, dst_off) {
//        dst[dst_off]   =  dbl_max;
//        dst[dst_off+1] =  dbl_max;
//        dst[dst_off+2] =  dbl_max;
//        dst[dst_off+3] = -dbl_max;
//        dst[dst_off+4] = -dbl_max;
//        dst[dst_off+5] = -dbl_max;
//}

function box_make_empty_0(dst) {
    dst[0] =  dbl_max;
    dst[1] =  dbl_max;
    dst[2] =  dbl_max;
    dst[3] = -dbl_max;
    dst[4] = -dbl_max;
    dst[5] = -dbl_max;
}

function box_area(src, src_off) {

    var dx = src[src_off+3] - src[src_off];
    var dy = src[src_off+4] - src[src_off+1];
    var dz = src[src_off+5] - src[src_off+2];

    if (dx < 0 || dy < 0 || dz < 0)
        return 0;

    return 2.0 * (dx * dy + dy * dz + dz * dx);
}

function box_area_0(src) {

    var dx = src[3] - src[0];
    var dy = src[4] - src[1];
    var dz = src[5] - src[2];

    if (dx < 0 || dy < 0 || dz < 0)
        return 0;

    return 2.0 * (dx * dy + dy * dz + dz * dx);
}





function bvh_split_info() {
    this.vb_left = new Float32Array(6);
    this.vb_right = new Float32Array(6);
    this.cb_left = new Float32Array(6);
    this.cb_right = new Float32Array(6);
    this.num_left = 0;
    this.best_split = -1;
    this.best_cost = -1;
    this.num_bins = -1;
}

bvh_split_info.prototype.reset = function () {
    this.num_left = 0;
    this.best_split = -1;
    this.best_cost = -1;
    this.num_bins = -1;
};


function bvh_bin() {
    this.box_bbox = new Float32Array(6); // bbox of all primitive bboxes
    this.box_centroid = new Float32Array(6); // bbox of all primitive centroids
    this.num_prims = 0; // number of primitives in the bin
}

bvh_bin.prototype.reset = function() {
    this.num_prims = 0; // number of primitives in the bin
    box_make_empty_0(this.box_bbox);
    box_make_empty_0(this.box_centroid);
};

function accum_bin_info() {
    this.BL = new Float32Array(6);
    this.CL = new Float32Array(6);
    this.NL = 0;
    this.AL = 0;
}

accum_bin_info.prototype.reset = function() {
    this.NL = 0;
    this.AL = 0;

    box_make_empty_0(this.BL);
    box_make_empty_0(this.CL);
};


//Scratch variables used by bvh_bin_axis
//TODO: can be replaced by a flat ArrayBuffer
var bins = [];
var i;
for (i=0; i<MAX_BINS; i++) {
    bins.push(new bvh_bin());
}

//TODO: can be replaced by a flat ArrayBuffer
var ai = [];
for (i=0; i<MAX_BINS-1; i++)
    ai.push(new accum_bin_info());

var BR = new Float32Array(6);
var CR = new Float32Array(6);


function assign_bins(bvh, start, end, axis, cb, cbdiag, num_bins) {

    var centroids = bvh.centroids;
    var primitives = bvh.primitives;
    var boxes = bvh.boxes;

    /* bin assignment */
    var k1 = num_bins * (1.0 - BOX_SCALE_EPSILON) / cbdiag[axis];
    var cbaxis = cb[axis];
    var sp = bvh.sort_prims;

    for (var j = start; j <= end; j++)
    {
        /* map array index to primitive index -- since primitive index array gets reordered by the BVH build*/
        /* while the primitive info array is not reordered */
        var iprim = primitives[j]|0;

        var fpbin = k1 * (centroids[iprim * 3/*POINT_STRIDE*/ + axis] - cbaxis);
        var binid = fpbin|0; //Truncate to int is algorithmic -> not an optimization thing!

        /* possible floating point problems */
        if (binid < 0)
        {
            binid = 0;
            //debug("Bin index out of range " + fpbin);
        }
        else if (binid >= num_bins)
        {
            binid = num_bins-1;
            //debug("Bin index out of range. " + fpbin);
        }

        /* Store the bin index for the partitioning step, so we don't recompute it there */
        sp[j] = binid;

        /* update other bin data with the new primitive */
        //var bin = bins[binid];
        bins[binid].num_prims ++;

        box_add_box_0(bins[binid].box_bbox, boxes, iprim * 6/*BOX_STRIDE*/);
        box_add_point_0(bins[binid].box_centroid, centroids, iprim * 3 /*POINT_STRIDE*/);
    }
    /* at this point all primitves are assigned to a bin */
}


function bvh_bin_axis(bvh, start, end, axis, cb, cbdiag, split_info) {

    /* if size is near 0 on this axis, cost of split is infinite */
    if (cbdiag[axis] < bvh.scene_epsilon)
    {
        split_info.best_cost = Infinity;
        return;
    }

    var num_bins = MAX_BINS;
    if (num_bins > end-start+1)
        num_bins = end-start+1;

    var i;
    for (i=0; i<num_bins; i++)
        bins[i].reset();

    for (i=0; i<num_bins-1; i++)
        ai[i].reset();

    split_info.num_bins = num_bins;

    assign_bins(bvh, start, end, axis, cb, cbdiag, num_bins);


    /* now do the accumulation sweep from left to right */
    box_copy_00(ai[0].BL, bins[0].box_bbox);
    box_copy_00(ai[0].CL, bins[0].box_centroid);
    ai[0].AL = box_area_0(ai[0].BL);
    ai[0].NL = bins[0].num_prims;
    var bin;
    for (i=1; i<num_bins-1; i++)
    {
        bin = bins[i];
        var aii = ai[i];
        box_copy_00(aii.BL, ai[i-1].BL);
        box_add_box_00(aii.BL, bin.box_bbox);
        aii.AL = box_area_0(aii.BL);

        box_copy_00(aii.CL, ai[i-1].CL);
        box_add_box_00(aii.CL, bin.box_centroid);

        aii.NL = ai[i-1].NL + bin.num_prims;
    }

    /* sweep from right to left, keeping track of lowest cost and split */
    i = num_bins - 1;
    box_copy_00(BR, bins[i].box_bbox);
    box_copy_00(CR, bins[i].box_centroid);
    var AR = box_area_0(BR);
    var NR = bins[i].num_prims;

    var best_split = i;
    var best_cost = AR * NR + ai[i-1].AL * ai[i-1].NL;
    box_copy_00(split_info.vb_right, BR);
    box_copy_00(split_info.cb_right, bins[i].box_centroid);
    box_copy_00(split_info.vb_left, ai[i-1].BL);
    box_copy_00(split_info.cb_left, ai[i-1].CL);
    split_info.num_left = ai[i-1].NL;

    for (i=i-1; i>=1; i--)
    {
        bin = bins[i];
        box_add_box_00(BR, bin.box_bbox);
        box_add_box_00(CR, bin.box_centroid);
        AR = box_area_0(BR);
        NR += bin.num_prims;

        var cur_cost = AR * NR + ai[i-1].AL * ai[i-1].NL;

        if (cur_cost <= best_cost)
        {
            best_cost = cur_cost;
            best_split = i;

            box_copy_00(split_info.vb_right, BR);
            box_copy_00(split_info.cb_right, CR);
            box_copy_00(split_info.vb_left, ai[i-1].BL);
            box_copy_00(split_info.cb_left, ai[i-1].CL);
            split_info.num_left = ai[i-1].NL;
        }
    }

    split_info.best_split = best_split;
    split_info.best_cost = best_cost;
}

function bvh_partition(bvh, start, end, axis, cb, cbdiag, split_info) {

    //At this point, the original algorithm does an in-place NON-STABLE partition
    //to move primitives to the left and right sides of the split plane
    //into contiguous location of the primitives list for use by
    //the child nodes. But, we want to preserve the ordering by size
    //without having to do another sort, so we have to use
    //a temporary storage location to copy into. We place right-side primitives
    //in temporary storage, then copy back into the original storage in the right order.
    //Left-side primitives are still put directly into the destination location.
    var primitives = bvh.primitives;
    //var centroids = bvh.centroids;
    var i,j;

    //sort_prims contains bin indices computed during the split step.
    //Here we read those and also use sort_prims as temporary holding
    //of primitive indices. Hopefully the read happens before the write. :)
    //In C it was cheap enough to compute this again...
    //var k1 = split_info.num_bins * (1.0 - BOX_SCALE_EPSILON) / cbdiag[axis];
    //var cbaxis = cb[axis];
    var sp = bvh.sort_prims;

    var right = 0;
    var left = start|0;
    var best_split = split_info.best_split|0;

    for (i=start; i<=end; i++) {
        var iprim = primitives[i]|0;
        //var fpbin = (k1 * (centroids[3/*POINT_STRIDE*/ * iprim + axis] - cbaxis));
        var binid = sp[i]; /* fpbin|0; */

        if (binid < best_split) {
            primitives[left++] = iprim;
        } else {
            sp[right++] = iprim;
        }
    }

    //if ((left-start) != split_info.num_left)
    //    debug("Mismatch between binning and partitioning.");

    //Copy back the right-side primitives into main primitives array, while
    //maintaining order
    for (j=0; j<right; j++) {
        primitives[left+j] = sp[j];
    }
    /* at this point the binning is complete and we have computed a split */
}


function bvh_fatten_inner_node(bvh, nodes, nodeidx, start, end, cb, cbdiag, poly_cut_off) {

    var primitives = bvh.primitives;
    var centroids = bvh.centroids;

    //Take the first few items to place into the inner node,
    //but do not go over the max item or polygon count.
    var prim_count = end - start + 1;

    if (prim_count > bvh.frags_per_inner_node)
        prim_count = bvh.frags_per_inner_node;

    if (prim_count > poly_cut_off)
        prim_count = poly_cut_off;


    nodes.setPrimStart(nodeidx, start);
    nodes.setPrimCount(nodeidx, prim_count);
    start += prim_count;

    //Because we take some primitives off the input, we have to recompute
    //the bounding box used for computing the node split.
    box_make_empty_0(cb);
    for (var i=start; i<=end; i++) {
        box_add_point_0(cb, centroids, 3/*POINT_STRIDE*/ * primitives[i]);
    }

    //Also update the split axis -- it could possibly change too.
    box_get_size(cbdiag, 0, cb, 0);
    //Decide which axis to split on.
    var axis = 0;
    if (cbdiag[1] > cbdiag[0])
        axis = 1;
    if (cbdiag[2] > cbdiag[axis])
        axis = 2;

    return axis;
}


var cbdiag = new Float32Array(3); //scratch variable used in bvh_subdivide

function bvh_subdivide(bvh,
                       nodeidx, /* current parent node to consider splitting */
                       start, end, /* primitive sub-range to be considered at this recursion step */
                       vb, /* bounding volume of the primitives' bounds in the sub-range */
                       cb, /* bounding box of primitive centroids in this range */
                       transparent, /* does the node contain opaque or transparent objects */
                       depth /* recursion depth */
                       )
{
    box_get_size(cbdiag, 0, cb, 0);
    var nodes = bvh.nodes;
    var frags_per_leaf = transparent ? bvh.frags_per_leaf_node_transparent : bvh.frags_per_leaf_node;
    var frags_per_inner = transparent ? bvh.frags_per_inner_node_transparent : bvh.frags_per_inner_node;
    var polys_per_node = bvh.max_polys_per_node;

    //Decide which axis to split on.
    var axis = 0;
    if (cbdiag[1] > cbdiag[0])
        axis = 1;
    if (cbdiag[2] > cbdiag[axis])
        axis = 2;

    //Whether the node gets split or not, it gets
    //the same overall bounding box.
    nodes.setBox0(nodeidx, vb);

    //Check the expected polygon count of the node
    var poly_count = 0;
    var poly_cut_off = 0;
    if (bvh.polygonCounts) {
        for (var i=start; i<=end; i++) {
            poly_count += bvh.polygonCounts[bvh.primitives[i]];
            poly_cut_off++;
            if (poly_count > polys_per_node)
                break;
        }
    }

    var prim_count = end - start + 1;

    var isSmall = ((prim_count <= frags_per_leaf) && (poly_count < polys_per_node)) ||
                  (prim_count === 1);

    //Decide whether to terminate recursion
    if (isSmall ||
      depth > MAX_DEPTH || //max recusrion depth
      cbdiag[axis] < bvh.scene_epsilon) //node would be way too tiny for math to make sense (a point)
    {
        nodes.setLeftChild(nodeidx, -1);
        nodes.setPrimStart(nodeidx, start);
        nodes.setPrimCount(nodeidx, end-start+1);
        nodes.setFlags(nodeidx, 0, 0, transparent ? 1 : 0);
        return;
    }

    //Pick the largest (first) primitives to live in this node
    //NOTE: this assumes primitives are sorted by size.
    //NOTE: This step is an optional departure from the original
    if (frags_per_inner) {
        axis = bvh_fatten_inner_node(bvh, nodes, nodeidx, start, end, cb, cbdiag, poly_cut_off);
        start = start + nodes.getPrimCount(nodeidx);
    }

    var split_info = new bvh_split_info();

    //Do the binning of the remaining primitives to go into child nodes
    bvh_bin_axis(bvh, start, end, axis, cb, cbdiag, split_info);

    if (split_info.num_bins < 0) {
        //Split was too costly, so add all objects to the current node and bail
        nodes.setPrimCount(nodeidx, nodes.getPrimCount(nodeidx) + end - start + 1);
        return;
    }

    bvh_partition(bvh, start, end, axis, cb, cbdiag, split_info);

    var child_idx = nodes.nextNodes(2);

    /* set info about split into the node */
    var cleft = (split_info.vb_left[3+axis] + split_info.vb_left[axis]) * 0.5;
    var cright = (split_info.vb_right[3+axis] + split_info.vb_right[axis]) * 0.5;

    nodes.setFlags(nodeidx, axis, cleft < cright ? 0 : 1, transparent ? 1 : 0);
    nodes.setLeftChild(nodeidx, child_idx);


    /* validate split */
    /*
    if (true) {
        for (var i=start; i< start+num_left; i++)
        {
            //int binid = (int)(k1 * (info->prim_info[info->bvh->iprims[i]].centroid.v[axis] - cb->min.v[axis]));
            var cen = primitives[i] * POINT_STRIDE;
            if (   centroids[cen] < split_info.cb_left[0]
                || centroids[cen] > split_info.cb_left[3]
                || centroids[cen+1] < split_info.cb_left[1]
                || centroids[cen+1] > split_info.cb_left[4]
                || centroids[cen+2] < split_info.cb_left[2]
                || centroids[cen+2] > split_info.cb_left[5])
            {
                debug ("wrong centroid box");
            }
        }

        for (i=start+num_left; i<=end; i++)
        {
            //int binid = (int)(k1 * (info->prim_info[info->bvh->iprims[i]].centroid.v[axis] - cb->min.v[axis]));
            var cen = primitives[i] * POINT_STRIDE;
            if (   centroids[cen] < split_info.cb_right[0]
                || centroids[cen] > split_info.cb_right[3]
                || centroids[cen+1] < split_info.cb_right[1]
                || centroids[cen+1] > split_info.cb_right[4]
                || centroids[cen+2] < split_info.cb_right[2]
                || centroids[cen+2] > split_info.cb_right[5])
            {
                debug ("wrong centroid box");
            }
        }
    }
    */

    /* recurse */
   //bvh_subdivide(bvh, child_idx, start, start + split_info.num_left - 1, split_info.vb_left, split_info.cb_left, transparent, depth+1);
   //bvh_subdivide(bvh, child_idx + 1, start + split_info.num_left, end, split_info.vb_right, split_info.cb_right, transparent, depth+1);

    //Iterative stack-based recursion for easier profiling
   bvh.recursion_stack.push([bvh, child_idx + 1, start + split_info.num_left, end, split_info.vb_right, split_info.cb_right, transparent, depth+1]);
   bvh.recursion_stack.push([bvh, child_idx, start, start + split_info.num_left - 1, split_info.vb_left, split_info.cb_left, transparent, depth+1]);

}


function compute_boxes(bvh) {

    var boxv_o = bvh.boxv_o;
    var boxc_o = bvh.boxc_o;
    var boxv_t = bvh.boxv_t;
    var boxc_t = bvh.boxc_t;

    box_make_empty_0(boxv_o);
    box_make_empty_0(boxc_o);
    box_make_empty_0(boxv_t);
    box_make_empty_0(boxc_t);

    var c = bvh.centroids;
    var b = bvh.boxes;

    for (var i=0, iEnd=bvh.prim_count; i<iEnd; i++) {


        box_get_centroid(c, 3/*POINT_STRIDE*/*i, b, 6/*BOX_STRIDE*/*i);

        if (i >= bvh.first_transparent) {

            box_add_point_0(boxc_t, c, 3/*POINT_STRIDE*/*i);
            box_add_box_0(boxv_t, b, 6/*BOX_STRIDE*/*i);

        } else {

            box_add_point_0(boxc_o, c, 3/*POINT_STRIDE*/*i);
            box_add_box_0(boxv_o, b, 6/*BOX_STRIDE*/*i);

        }
    }

    box_get_size(cbdiag, 0, bvh.boxv_o, 0);
    var maxsz = Math.max(cbdiag[0], cbdiag[1], cbdiag[2]);
    bvh.scene_epsilon = BOX_EPSILON * maxsz;
}




    //Module exports
    return {
        bvh_subdivide : bvh_subdivide,
        compute_boxes : compute_boxes,
        box_area : box_area
    };

}();



//Given a list of LMV fragments, builds a spatial index for view-dependent traversal and hit testing
function BVHBuilder(fragments, materialDefs) {

    //Invariants
    this.boxes = fragments.boxes; //Array of Float32, each bbox is a sextuplet
    this.polygonCounts = fragments.polygonCounts;
    this.materials = fragments.materials; //material indices (we need to know which fragments are transparent)
    this.materialDefs = materialDefs;

    this.prim_count = fragments.length;

    //To be initialized by build() function based on build options
    this.frags_per_leaf_node = -1;
    this.frags_per_inner_node = -1;
    this.nodes = null;

    this.work_buf = new ArrayBuffer(this.prim_count * 4);
    this.sort_prims = new Int32Array(this.work_buf);

    //Allocate memory buffer for re-ordered fragment primitive indices,
    //which will be sorted by node ownership and point to the index
    //of the fragment data.
    this.primitives = new Int32Array(this.prim_count);

    //The BVH split algorithm works based on centroids of the bboxes.
    this.centroids = new Float32Array(POINT_STRIDE * this.prim_count);

    //BBoxes and centroid bboxes for opaque and transparent primitive sets
    this.boxv_o = new Float32Array(6);
    this.boxc_o = new Float32Array(6);
    this.boxv_t = new Float32Array(6);
    this.boxc_t = new Float32Array(6);


    this.recursion_stack = [];
}

BVHBuilder.prototype.sortPrimitives = function() {

    var prim_sizes = new Float32Array(this.work_buf);
    var matDefs = this.materialDefs;
    var matInds = this.materials;
    var primitives = this.primitives;
    var numTransparent = 0;

    var i, iEnd;
    for (i=0, iEnd=this.prim_count; i<iEnd; i++) {

        //Start with trivial 1:1 order of the indices array
        primitives[i] = i;

        var transparent = matDefs && matDefs[matInds[i]] ? matDefs[matInds[i]].transparent : false;

        if (transparent)
            numTransparent++;

        if (WANT_SORT) {
            prim_sizes[i] = BVHModule.box_area(this.boxes, BOX_STRIDE*i);

            //In order to make transparent objects appear last,
            //we give them a negative size, so that they are naturally
            //sorted last in the sort by size.
            if (transparent)
                prim_sizes[i] = -prim_sizes[i];
        } else {
            //We still need the transparency flag for the loop below
            //where we find the last opaque item, but we can
            //short-cut the size computation.
            prim_sizes[i] = transparent ? -1 : 1;
        }
    }

    //Sort the input objects by size
    //TODO: Actually, we assume all LMV SVF files come
    //sorted by draw priority already, so we can skip this step.
    //However, the transparent objects do not always come last (bug in LMVTK?),
    //so we still have to pull them out to the end of the list
    var WANT_SORT = false;

    if (WANT_SORT) {
        Array.prototype.sort.call(this.primitives, function(a, b) {
            return prim_sizes[b] - prim_sizes[a];
        });
    } else {
        if (numTransparent && numTransparent < this.prim_count) {

            var tmpTransparent = new Int32Array(numTransparent);
            var oidx = 0, tidx = 0;

            for (i=0, iEnd = this.prim_count; i<iEnd; i++) {
                if (prim_sizes[i] >= 0)
                    primitives[oidx++] = primitives[i];
                else
                    tmpTransparent[tidx++] = primitives[i];
            }

            primitives.set(tmpTransparent, this.prim_count - numTransparent);
        }
    }

    this.first_transparent = this.prim_count - numTransparent;
};


BVHBuilder.prototype.build = function(options) {
    //Kick off the BVH build.

    var useSlimNodes = options && !!options.useSlimNodes;

    var self = this;
    function assign_option(name, defaultVal) {
        if (options.hasOwnProperty(name))
            self[name] = options[name];
        else
            self[name] = defaultVal;
    }

    //options for build optimized for rasterization renderer scenes
    if (useSlimNodes) {
        assign_option("frags_per_leaf_node", 1);
        assign_option("frags_per_inner_node", 0);
        assign_option("frags_per_leaf_node_transparent", 1);
        assign_option("frags_per_inner_node_transparent", 0);
        assign_option("max_polys_per_node", Infinity);
    } else {
        var multiplier = options.isWeakDevice ? 0.5 : 1.0;

        //TODO: tune these constants
        assign_option("frags_per_leaf_node", 0 | (32 * multiplier));
        //Placing fragments at inner nodes places more emphasis on bigger objects during tree traversal
        //but it can only be done for opaque objects. Transparent objects have to be strictly back to front
        //traversal regardless of size, unless a unified traversal
        assign_option("frags_per_inner_node", 0|(this.frags_per_leaf_node) );
        assign_option("frags_per_leaf_node_transparent", this.frags_per_leaf_node);
        assign_option("frags_per_inner_node_transparent", 0);
        assign_option("max_polys_per_node", 0 | (10000 * multiplier));
    }

    //Reuse existing node array if there
    if (this.nodes && (this.nodes.is_lean_node == useSlimNodes))
        this.nodes.nodeCount = 0;
    else {
        var est_nodes = this.prim_count / this.frags_per_leaf_node;
        var num_nodes = 1;
        while (num_nodes < est_nodes)
            num_nodes *= 2;

        this.nodes = new NodeArray(num_nodes, options ? options.useSlimNodes : false);
    }

    this.sortPrimitives();

    BVHModule.compute_boxes(this);

    //Init the root nodes at 0 for opaque
    //and 1 for transparent objects
    var root = this.nodes.nextNodes(2);

    //Now kick off the recursive tree build

    //Opaque
    BVHModule.bvh_subdivide(this, root, 0, this.first_transparent - 1, this.boxv_o, this.boxc_o, false, 0);

    var a;
    while(this.recursion_stack.length) {
        a = this.recursion_stack.pop();
        BVHModule.bvh_subdivide(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]);
    }

    //Transparent
    BVHModule.bvh_subdivide(this, root+1, this.first_transparent, this.prim_count-1, this.boxv_t, this.boxc_t, true, 0);

    while(this.recursion_stack.length) {
        a = this.recursion_stack.pop();
        BVHModule.bvh_subdivide(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]);
    }
};

avp.NodeArray = NodeArray;
avp.BVHBuilder = BVHBuilder;

})();

(function() {

'use strict';

var av = Autodesk.Viewing,
    avp = Autodesk.Viewing.Private,
    lmv = Autodesk.LMVTK;

avp.DefaultLightPreset = 1; // "Sharp Highlights"
avp.DefaultLightPreset2d = 0;   // "Simple Grey"

avp.ModelSettingsEnvironment = null; // env. settings provided by the last call to setLightPresetFromFile

    avp.BackgroundPresets = {
        "Fusion Grey":      [230, 230, 230, 150, 150, 150],
        "Sky Blue":         [226, 244, 255, 156, 172, 180],
        "Snow":             [181, 186, 199, 181, 186, 199],
        "Midnight":         [ 41,  76, 120,   1,   2,   3],
        "White":            [255, 255, 255, 255, 255, 255],
        "AutoCADModel":     [ 30,  40,  48,  30,  40,  48],
        "Dark Grey":        [ 51,  51,  51,  51,  51,  51],
        "Dark Sky":         [ 51,  51,  51,  51,  51,  51],
        "Infinity Pool":    [255, 255, 255, 255, 255, 255],
        "Tranquility":      [  0,  84, 166,   0,  84, 166],
        "Grey Room":        [129, 129, 129, 129, 129, 129],
        "Photo Booth":      [237, 237, 237, 237, 237, 237],
        "RaaS SBS":         [  1,   1,   1,  90,  90,  90],
        "Plaza":            [ 79, 102, 130,  79, 102, 130],

        //This will get modified when the user changes the background
        //using the color picker.
        "Custom":           [230, 230, 230, 150, 150, 150]
    };

    var bg = avp.BackgroundPresets;

    avp.LightPresets = [
        //Notes: tonemap = which tone map method to use. Any tonemap method other than zero will cause colors to be linearized before use.
        //              0 = None, 1 = Prism Cannon-Lum (color preserving), 2 = OGC Cannon RGB (non-color preserving)
        //       exposure = exponential bias to use as pre-tonemap multiplier for all rendered colors, including background
        //       lightMultiplier = linear scale of direct light intensity (diffuse only, not ambient)
        //       bgColorGradient = which background color preset to use as default for the environment map
        //       illuminance     = cosine-weighted integral of the upper-hemisphere (i.e., actual lux)

        //Image-based lighting from RaaS. Initial exposure is empirically obtained.
        //These do not normally require any extra lights, because they have the lights fully baked into
        //the environment maps.

        //Simple ***non-HDR*** environment.
        {
            name: "Simple Grey",    // localized in viewer-environments.loc.json
            path:null,
            tonemap:0,
            E_bias:0,
            directLightColor: [1.0, 0.84, 0.67],
            ambientColor:     [0.8*0.25, 0.9*0.25,  1.0*0.25],
            lightMultiplier: 1.0,
            bgColorGradient: bg["Fusion Grey"],
            darkerFade: false,
            rotation: 0.0
        },

        //Fusion Environments which require extra lights

        // The E_bias value for the Fusion render-space environments is setup such that
        // the default values match the preset values of brightness (in lux) and EV.
        // The EV value from Fusion follows the Canon standard for luminance and middle-gray
        // https://en.wikipedia.org/wiki/Exposure_value#EV_as_a_measure_of_luminance_and_illuminance [September 2015]
        //
        // Rationale (using the canon tonemap as a guide, based on documentation by Adam Arbree):
        // 1. BaseExposure (B) in the canon tonemap is the negative log2 luminance of the
        //    white point (W) so B = -log2(W)
        // 2. To match the target illuminance from Fusion, the environment needs
        //    to be scaled by the ratio between the target and its actual illuminance, thus
        //    S = target_illuminance / actual_illuminance
        // 3. Then by the definition of middle grey W = L / (0.18*S) where L is the middle grey
        //    luminance and 0.18 is the standard reflection of middle grey.
        // 4. As per the Wikipedia entry, we have L = 2^(EV-3)
        // 5. Putting this all together we have
        //      B = -log2( 2^(EV-3) / (0.18*S))
        //        = log2(0.18) + log2(S) – (EV – 3)
        //        = (3+log2(0.18)) – EV + log2(S)
        //        = 0.526069 – EV + log2(S)

        {
            name: "Sharp Highlights",    // localized in viewer-environments.loc.json
            path:"SharpHighlights",
            type:"logluv",
            tonemap:1,
            // illuminance currently is not used elsewhere in LMV, its effect is folded into E_bias.
            //illuminance: 1000.0,
            E_bias:-9.0, // EV 9.526, 1000.0 lux (target)
            directLightColor: [0.5,0.5,0.5],
            ambientColor: [0.25/8,0.25/8,0.25/8],
            lightMultiplier: 0.0,
            lightDirection: [0.5, -0.2, -0.06],
            bgColorGradient: bg["Photo Booth"],
            darkerFade: true,
            rotation: 0.0
        },

        {
            name: "Dark Sky",     // "Dark Sky", localized in viewer-environments.loc.json
            path:"DarkSky",
            type:"logluv",
            tonemap:1,
            E_bias:-1,
            directLightColor: [1,1,1],
            ambientColor: [0.25/8,0.25/8,0.25/8], //0.25 with gain of 0.125
            lightMultiplier: 1.0,
            lightDirection: [0.1, -0.55, -1.0],
            bgColorGradient: bg["Dark Sky"],
            darkerFade: false,
            rotation: 0.0
        },

        {
            name: "Grey Room",    // "Grey Room", localized in viewer-environments.loc.json
            path:"GreyRoom",
            type:"logluv",
            tonemap:1,
            E_bias:-1,
            directLightColor: [1,1,1],
            ambientColor: [0.25/8,0.25/8,0.25/8],
            lightMultiplier: 0.5,
            lightDirection: [0.1, -0.55, -1.0],
            bgColorGradient: bg["Grey Room"],
            darkerFade: true,
            rotation: 0.0
        },

        {
            name: "Photo Booth",     // "Photo Booth", localized in viewer-environments.loc.json
            path:"PhotoBooth",
            type:"logluv",
            tonemap:1,
            E_bias:0,
            directLightColor: [1,1,1],
            ambientColor: [0.25/8,0.25/8,0.25/8],
            lightMultiplier: 0.5,
            lightDirection: [0.1, -0.55, -1.0],
            bgColorGradient: bg["Photo Booth"],
            darkerFade: true,
            rotation: 0.0
        },

        {
            name: "Tranquility",     // "Tranquility", localized in viewer-environments.loc.json
            path:"TranquilityBlue",
            type:"logluv",
            tonemap:1,
            E_bias:-1,
            directLightColor: [1,1,1],
            ambientColor: [0.25/8,0.25/8,0.25/8],
            lightMultiplier: 0.5,
            lightDirection: [0.1, -0.55, -1.0],
            bgColorGradient: bg["Tranquility"],
            darkerFade: false,
            rotation: 0.0
        },

        {
            name: "Infinity Pool",     // "Infinity Pool", localized in viewer-environments.loc.json
            path: "InfinityPool",
            type:"logluv",
            tonemap:1,
            E_bias:-1,
            directLightColor: [1.0, 0.84, 0.67],
            ambientColor: [0.25/8,0.25/8,0.25/8],
            lightMultiplier: 0.5,
            lightDirection: [0.1, -0.55, -1.0],
            bgColorGradient: bg["Infinity Pool"],
            darkerFade: false,
            rotation: 0.0
        },

        // Non fusion environments

        //White background, no HDR -- for cases like SIM360 models
        {
            name: "Simple White",     //"Simple White", localized in viewer-environments.loc.json
            path:null,
            tonemap:0,
            E_bias:0,
            directLightColor: [1,1,1],
            ambientColor: [0.25, 0.25, 0.25],
            lightMultiplier: 1.0,
            bgColorGradient: bg["White"],
            saoRadius: 0.06,
            saoIntensity: 0.15,
            darkerFade: true,
            rotation: 0.0
        },
/*
        {
            name: "Simple Black",
            path:null,
            tonemap:0,
            E_bias:0,
            directLightColor: [1.0, 0.84, 0.67],
            ambientColor:     [0.8, 0.9,  1.0],
            lightMultiplier: 1.0,
            bgColorGradient: bg["AutoCADModel"],
            darkerFade: false
        },
  */
        //RaaS environments
        {
            name: "Riverbank",     // "Riverbank", localized in viewer-environments.loc.json
            path:"riverbank",
            type:"logluv",
            tonemap:1,
            E_bias:-5.7,
            directLightColor: [1,1,1],
            lightMultiplier: 0.0,
            bgColorGradient: bg["Sky Blue"],
            darkerFade: false,
            rotation: 0.0
        },

        {
            name: "Contrast",     // "Contrast", localized in viewer-environments.loc.json
            path:"IDViz",
            type:"logluv",
            tonemap:1,
            E_bias:0,
            directLightColor: [1,1,1],
            lightMultiplier: 0.0,
            bgColorGradient: bg["Midnight"],
            darkerFade: false,
            rotation: 0.0
        },

        {
            name: "Rim Highlights",     //  localized in viewer-environments.loc.json
            path:"RimHighlights",
            type:"logluv",
            tonemap:1,
            //illuminance: 1000.0,
            E_bias:-9.0, // EV 9.526, 1000.0 lux (target)
            directLightColor: [0.5,0.5,0.5],
            ambientColor: [0.25/8,0.25/8,0.25/8],
            lightMultiplier: 0.0,
            lightDirection: [0.35, -0.35, -0.5],
            bgColorGradient: bg["Photo Booth"],
            darkerFade: true,
            rotation: 0.0
        },
        {
            name: "Cool Light",     // "Cool Light", localized in viewer-environments.loc.json
            path:"CoolLight",
            type:"logluv",
            tonemap:1,
            //illuminance: 1000.0,
            E_bias:-9.0, // EV 9.526, 1000.0 lux (target)
            directLightColor: [1,1,1],
            ambientColor: [0.25/8,0.25/8,0.25/8],
            lightMultiplier: 0.0,
            lightDirection: [-0.0, -0.15, -0.5],
            bgColorGradient: bg["Fusion Grey"],
            darkerFade: true,
            rotation: 0.0
        },

        {
            name: "Warm Light",     // "Warm Light", localized in viewer-environments.loc.json
            path:"WarmLight",
            type:"logluv",
            tonemap:1,
            //illuminance: 1000.0,
            E_bias:-9.0, // EV 9.526, 1000.0 lux (target)
            directLightColor: [1,1,1],
            ambientColor: [0.25/8,0.25/8,0.25/8],
            lightMultiplier: 0.0,
            lightDirection: [-0.0, -0.15, -0.5],
            bgColorGradient: bg["Fusion Grey"],
            darkerFade: true,
            rotation: 0.0
        },

        {
            name: "Soft Light",     // "Soft Light", localized in viewer-environments.loc.json
            path:"SoftLight",
            type:"logluv",
            tonemap:1,
            //illuminance: 1000.0,
            E_bias:-9.0, // EV 9.526, 1000.0 lux (target)
            directLightColor: [1,1,1],
            ambientColor: [0.25/8,0.25/8,0.25/8],
            lightMultiplier: 0.0,
            lightDirection: [-0.5, -0.5, 0.0],
            bgColorGradient: bg["Fusion Grey"],
            darkerFade: true,
            rotation: 0.0
        },

        {
            name: "Grid Light",     // "Grid Light", localized in viewer-environments.loc.json
            path:"GridLight",
            type:"logluv",
            tonemap:1,
            //illuminance: 1000.0,
            E_bias:-9.0, // EV 9.526, 1000.0 lux (target)
            directLightColor: [1,1,1],
            ambientColor: [0.25/8,0.25/8,0.25/8],
            lightMultiplier: 0.0,
            lightDirection: [-0.5, -0.6, 0.0],
            bgColorGradient: bg["Fusion Grey"],
            darkerFade: true,
            rotation: 0.0
        },

        {
            name: "Plaza",             //  "Plaza", localized in viewer-environments.loc.json
            path:"Plaza",
            type:"logluv",
            tonemap:1,
            //illuminance: 24157.736,
            E_bias: -14.0, // FIXME: EV 14.526, 50000.0 lux in the GUI, yet it does not seem to use illuminance
            directLightColor: [0.9, 0.9, 1],
            ambientColor: [0.25/8,0.25/8,0.25/8],
            lightMultiplier: 0.0, //8000.0, Turned off -- until we support world space light positioning.
            lightDirection: [-0.2, -0.18, 0.72],
            bgColorGradient: bg["Plaza"],
            darkerFade: false,
            rotation: 0.0
        },

        {
            name: "Snow Field",            //  "Snow Field", localized in viewer-environments.loc.json
            path:"SnowField",
            type:"logluv",
            tonemap:1,
            //illuminance: 4302.7773,
            E_bias: -10.461343,  // EV 14.526, 50000.0 lux (target)
            directLightColor: [1,1,1],
            ambientColor: [0.25/8,0.25/8,0.25/8],
            lightMultiplier: 0.0, //800.0, Turned off -- until we support world space light positioning.
            lightDirection: [0.0, -1.0, 0.0],
            bgColorGradient: bg["Snow"],
            darkerFade: false,
            rotation: 0.0
        }
    ];

    avp.DebugEnvironments = [
             //More RaaS ones

            {
                name: "Field",            //  "Field", localized in viewer-environments.loc.json
                path:"field",
                type:"logluv",
                tonemap:1,
                E_bias:-2.9,
                directLightColor: [1,1,1],
                lightMultiplier: 0.0,
                bgColorGradient: bg["Sky Blue"],
                darkerFade: false,
                rotation: 0.0
            },
            {
                name: "Crossroads",         //  "Crossroads", localized in viewer-environments.loc.json
                path:"crossroads",
                type:"logluv",
                tonemap:1,
                E_bias:-5.5,
                directLightColor: [1,1,1],
                lightMultiplier: 0.0,
                bgColorGradient: bg["Sky Blue"],
                darkerFade: false,
                rotation: 0.0
            },

            {
                name: "Seaport",            //  "Seaport", localized in viewer-environments.loc.json
                path:"seaport",
                type:"logluv",
                tonemap:1,
                E_bias:-6.5,
                directLightColor: [1,1,1],
                lightMultiplier: 0.0,
                bgColorGradient: bg["Sky Blue"],
                darkerFade: false,
                rotation: 0.0
            },

            {
                name: "Glacier",            //  "Glacier", localized in viewer-environments.loc.json
                path:"glacier",
                type:"logluv",
                tonemap:1,
                E_bias:0,
                directLightColor: [1,1,1],
                lightMultiplier: 0.0,
                bgColorGradient: bg["Midnight"],
                darkerFade: false,
                rotation: 0.0
            },

            {
                name: "Boardwalk",           //  "Boardwalk", localized in viewer-environments.loc.json
                path:"boardwalk",
                type:"logluv",
                tonemap:1,
                E_bias:-7.0,
                directLightColor: [1,1,1],
                lightMultiplier: 0.0,
                bgColorGradient: bg["Sky Blue"],
                darkerFade: false,
                rotation: 0.0
            },

            {
                name: "RaaS Test Env",      // localized in viewer-environments.loc.json
                path:"Reflection",
                type:"logluv",
                tonemap:2,
                E_bias:-1.5,
                directLightColor: [1,1,1],
                lightMultiplier: 0.0,
                bgColorGradient: bg["RaaS SBS"],
                darkerFade: false,
                rotation: 0.0
            }
    ];

    if (avp.ENABLE_DEBUG) {
        avp.LightPresets = avp.LightPresets.concat(avp.DebugEnvironments);
    }

    /**
     * Copies properties from a Preset (src) into a user provided preset (env)
     * Ideally, this function is used with avp.ModelSettingsEnvironment
     */
    avp.copyLightPreset = function(src, env) {
        env.name = src.name + " (copy)";
        env.path = src.path;
        env.type = src.type;
        env.tonemap = src.tonemap;
        env.E_bias = src.E_bias;
        env.directLightColor = src.directLightColor;
        env.ambientColor = src.ambientColor;
        env.lightMultiplier = src.lightMultiplier;
        env.bgColorGradient = src.bgColorGradient;
        env.darkerFade = src.darkerFade;
        env.rotation = src.rotation;
    };


    avp.CreateCubeMapFromColors = function(ctop, cbot) {
        var r1 = ctop.x * 255, g1 = ctop.y * 255, b1 = ctop.z * 255,
            r2 = cbot.x * 255, g2 = cbot.y * 255, b2 = cbot.z * 255;

        var pixelsTop = new Uint8Array(16);
        var pixelsBot = new Uint8Array(16);
        var pixelsSide = new Uint8Array(16);

        for (var i=0; i<4; i++) {
            pixelsTop[i*4] = r1;
            pixelsTop[i*4+1] = g1;
            pixelsTop[i*4+2] = b1;
            pixelsTop[i*4+3] = 255;

            pixelsBot[i*4] = r2;
            pixelsBot[i*4+1] = g2;
            pixelsBot[i*4+2] = b2;
            pixelsBot[i*4+3] = 255;

            // was this, which is wild: if (0 | (i / 2)) {
            if ( i > 1 ) {
				// color sides 2 and 3 with the first color
                pixelsSide[i*4] = r1;
                pixelsSide[i*4+1] = g1;
                pixelsSide[i*4+2] = b1;
                pixelsSide[i*4+3] = 255;
            }
            else {
				// color sides 0 and 1 with the second color
                pixelsSide[i*4] = r2;
                pixelsSide[i*4+1] = g2;
                pixelsSide[i*4+2] = b2;
                pixelsSide[i*4+3] = 255;
            }
        }

        var x_neg = new THREE.DataTexture( pixelsSide, 2, 2, THREE.RGBAFormat );
        var x_pos = new THREE.DataTexture( pixelsSide, 2, 2, THREE.RGBAFormat );
        var y_neg = new THREE.DataTexture( pixelsBot, 2, 2, THREE.RGBAFormat );
        var y_pos = new THREE.DataTexture( pixelsTop, 2, 2, THREE.RGBAFormat );
        var z_neg = new THREE.DataTexture( pixelsSide, 2, 2, THREE.RGBAFormat );
        var z_pos = new THREE.DataTexture( pixelsSide, 2, 2, THREE.RGBAFormat );

        var texture = new THREE.Texture(null, THREE.CubeReflectionMapping,
                                        THREE.RepeatWrapping, THREE.RepeatWrapping,
                                        THREE.LinearFilter, THREE.LinearFilter,
                                        //THREE.NearestFilter, THREE.NearestFilter,
                                        THREE.RGBAFormat);
        texture.image = [x_pos, x_neg, y_pos, y_neg, z_pos, z_neg];
        texture.needsUpdate = true;

        return texture;
    };


    var M = [6.0014, -2.7008, -1.7996, -1.3320,  3.1029, -5.7721, 0.3008, -1.0882,  5.6268];

    function LogLuvDecode(dst, src) {

        var Le = src[2] * 255.0 + src[3];
        var Xp_Y_XYZp_y = Math.pow(2.0, (Le - 127.0) / 2.0);
        var Xp_Y_XYZp_z = Xp_Y_XYZp_y / (src[1]);
        var Xp_Y_XYZp_x = (src[0]) * Xp_Y_XYZp_z;

        var r = M[0] * Xp_Y_XYZp_x + M[3] * Xp_Y_XYZp_y + M[6] * Xp_Y_XYZp_z;
        var g = M[1] * Xp_Y_XYZp_x + M[4] * Xp_Y_XYZp_y + M[7] * Xp_Y_XYZp_z;
        var b = M[2] * Xp_Y_XYZp_x + M[5] * Xp_Y_XYZp_y + M[8] * Xp_Y_XYZp_z;

        if (r < 0) r = 0;
        if (g < 0) g = 0;
        if (b < 0) b = 0;

        dst[0] = r;
        dst[1] = g;
        dst[2] = b;
    }

    function RGBMEncode(dst, src, expScale) {

        var r = Math.sqrt(src[0]*expScale)*0.0625; // 1/16 = 0.0625
        var g = Math.sqrt(src[1]*expScale)*0.0625;
        var b = Math.sqrt(src[2]*expScale)*0.0625;

        var maxL = Math.max( Math.max(r, g), Math.max(b, 1e-6));
        if (maxL > 1.0)
            maxL = 1.0;

        var w = Math.ceil( maxL * 255.0 ) / 255.0;

        if (r > 1.0)
            r = 1.0;
        if (g > 1.0)
            g = 1.0;
        if (b > 1.0)
            b = 1.0;

        dst[3] = w;
        var a = 1.0 / w;

        dst[0] = r * a;
        dst[1] = g * a;
        dst[2] = b * a;
    }

    function RGB16Encode(dst, src, expScale) {

        var r = Math.sqrt(src[0]*expScale);
        var g = Math.sqrt(src[1]*expScale);
        var b = Math.sqrt(src[2]*expScale);

        //That's pretty unlikely to happen...
        var MAX_HALF = 65504;
        if (r > MAX_HALF)
            r = MAX_HALF;
        if (g > MAX_HALF)
            g = MAX_HALF;
        if (b > MAX_HALF)
            b = MAX_HALF;

        dst[0] = r;
        dst[1] = g;
        dst[2] = b;

    }


    var tmpSrc = new Float32Array(4);
    var tmpDst = new Float32Array(4);

    //Converts incoming environment cube maps to image format suitable for use by the shader.
    avp.DecodeEnvMap = function(map, exposure, useHalfFloat, callback) {

        if (!map.LogLuv) {
            avp.logger.warn("Environment map expected to be in LogLuv format.");
            return;
        }

        var scale = Math.pow(2.0, exposure);

		// if `map.image` is an array, use it as it is, otherwise create an array with single item (`map.image`) in it
        var images = Array.isArray(map.image) ? map.image : [map.image];

        for (var i=0; i<images.length; i++) {

            var image = images[i];

            for (var j=0; j<image.mipmaps.length; j++) {

                var mipmap = image.mipmaps[j];

                var src = mipmap.data;

                var dst;
                if (useHalfFloat) {
                    //var dst = new Float32Array(src.length / 4 * 3);
                    dst = new Uint16Array(src.length / 4 * 3);
                    mipmap.data = dst;
                }
                else
                    dst = src.buffer;

                var m=0;

                for (var k=0; k<src.length; k+=4) {

                    tmpSrc[0] = src[k] / 255.0;
                    tmpSrc[1] = src[k+1] / 255.0;
                    tmpSrc[2] = src[k+2] / 255.0;
                    tmpSrc[3] = src[k+3] / 255.0;

                    LogLuvDecode(tmpDst, tmpSrc);

                    if (useHalfFloat) {
                        //Use sqrt to gamma-compress the data to help the texture filtering
                        //hardware.
                        RGB16Encode(tmpSrc, tmpDst, scale);
                        dst[m++] = avp.FloatToHalf(tmpSrc[0]);
                        dst[m++] = avp.FloatToHalf(tmpSrc[1]);
                        dst[m++] = avp.FloatToHalf(tmpSrc[2]);
                    } else {
                        //Temporary: decode incoming LogLUV environments and convert them
                        //to RGBM format for use by the shader. Eventually we will use half-float format
                        //instead, but that has to be better tested.
                        RGBMEncode(tmpSrc, tmpDst, scale);

                        src[k] = Math.round(tmpSrc[0] * 255.0);
                        src[k+1] = Math.round(tmpSrc[1] * 255.0);
                        src[k+2] = Math.round(tmpSrc[2] * 255.0);
                        src[k+3] = Math.round(tmpSrc[3] * 255.0);
                    }
                }

            }

        }

        map.LogLuv = false;

        if (useHalfFloat) {
            map.type = THREE.HalfFloatType;
            map.format = THREE.RGBFormat;
            map.RGBM = false;
            map.GammaEncoded = true;
        }
        else
            map.RGBM = true;

        if (callback)
            callback(map);
    };


    //web worker used for image processing, etc.
    avp.imageWorker = null;
    var messageId = 1;

    function getTransferables(map) {

        var res = [];

        // if `map.image` is an array, use it as it is, otherwise create an array with single item (`map.image`) in it
        var images = Array.isArray(map.image) ? map.image : [map.image];

        for (var i=0; i<images.length; i++) {

            var image = images[i];

            for (var j=0; j<image.mipmaps.length; j++) {

                var mipmap = image.mipmaps[j];

                res.push(mipmap.data.buffer);
            }
        }

        return res;
    }

    avp.DecodeEnvMapAsync = function(map, exposure, useHalfFloat, callback) {

        if (!map.LogLuv) {
            avp.logger.warn("Environment map expected to be in LogLuv format.");
            return;
        }

        if (!avp.imageWorker)
            avp.imageWorker = avp.createWorker();

        var id = messageId++;

        var onMessage = function(msg) {

            if (msg.data.id !== id)
                return;

            avp.imageWorker.removeEventListener("message", onMessage);

            var mapWorker = msg.data.map;
            map.image = mapWorker.image;

            map.LogLuv = false;

            if (useHalfFloat) {
                map.type = THREE.HalfFloatType;
                map.format = THREE.RGBFormat;
                map.RGBM = false;
                map.GammaEncoded = true;
            }
            else
                map.RGBM = true;

            callback(map);
        };

        avp.imageWorker.addEventListener("message", onMessage);

        avp.imageWorker.postMessage({
            operation: "DECODE_ENVMAP",
            map: map,
            exposure: exposure,
            useHalfFloat: useHalfFloat,
            id: id
        }, getTransferables(map));
    };


    lmv.doDecodeEnvmap = function(loadContext) {

        avp.DecodeEnvMap(loadContext.map, loadContext.exposure, loadContext.useHalfFloat);

        self.postMessage({ map: loadContext.map, id: loadContext.id }, getTransferables(loadContext.map));
    };

})();


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
            var ret = options.oss_url + "/buckets/" + bucket + "/objects/" + encodeURIComponent(decodeURIComponent(object));
            return ret;
        }
    };

    /**
     * Construct full URL given a potentially partial viewing service "urn:" prefixed resource
     * @returns {string}
     */
    ViewingService.generateUrl = function (baseUrl, api, path) {

        path = simplifyPath(path);

        //Check if it's a viewing service item path
        if (path.indexOf('urn:') !== 0)
            return path;

        var res = baseUrl + "/";

        if (api !== 'items') {
            // Remove 'urn:' prefix when calling /items API.
            path = path.substr(4);
        }

        //TODO: WTF... we should not be checking the env parameter like this.
        //Check the endpoint URL for being raw viewing service or something....
        if (api === "bubbles" && avp.env.indexOf('Autodesk') == 0) {
            // The bubbles API for PAAS endpoint (where environment is prefixed with 'Autodesk')
            // has no explicit 'bubble' in the URL path.
            res += path;
        } else {
            res += api + "/" + path;
        }

        return res;
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
            onFailure(request.status, request.statusText, {url: url});
        }

        function onLoad(e) {
            if (request.status === 200) {

                if (request.response
                    && request.response instanceof ArrayBuffer) {
                    var rawbuf = new Uint8Array(request.response);
                    //It's possible that if the Content-Encoding header is set,
                    //the browser unzips the file by itself, so let's check if it did.
                    if (rawbuf[0] == 31 && rawbuf[1] == 139) {
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
        options.oss_url = loadContext.oss_url;
    }

    //Utility function called from the web worker to set up the options for a get request,
    //then calling ViewingService.get internally
    ViewingService.getItem = function (loadContext, url, onSuccess, onFailure, options) {

        options = options || {};

        copyOptions(loadContext, options);

        ViewingService.rawGet(loadContext.viewing_url, 'items', url, onSuccess, onFailure, options);

    };

    //Utility function called from the web worker to set up the options for a get request,
    //then calling ViewingService.get internally
    ViewingService.getManifest = function (loadContext, url, onSuccess, onFailure, options) {

        options = options || {};

        if (!options.hasOwnProperty("responseType"))
            options.responseType = "json";

        copyOptions(loadContext, options);

        ViewingService.rawGet(loadContext.viewing_url, 'bubbles', url, onSuccess, onFailure, options);

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

        ViewingService.rawGet(loadContext.viewing_url, 'thumbnails', url, onSuccess, onFailure, options);

    };


    ViewingService.getACMSession = function (acmUrl, acmProperties, onSuccess, onFailure) {

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
        xhr.open("POST", acmUrl, true);
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

var av = Autodesk.Viewing,
    lmv = Autodesk.LMVTK,
    avp = av.Private;

function guardFunction(loadContext, f) {
    try {
        f();
    }
    catch (exc) {
        loadContext.raiseError(
            av.ErrorCodes.BAD_DATA, "Unhandled exception while reading pack file",
            { "url": loadContext.url, "exception": exc.toString(), "stack": exc.stack });
    }
}

function doGeomLoad(loadContext) {

    var _this = loadContext.worker;

    //Make a blocking request -- it's ok, because
    //we are in a worker thread.

    function onSuccess(arrayBuffer) {
        _this.postMessage({
            url: loadContext.url,
            workerId: loadContext.workerId,
            progress: 0.5
        }); //rough progress reporting -- can do better

        guardFunction(loadContext, function() {

            var pfr = new lmv.PackFileReader(arrayBuffer);

            var raisedError = false;

            var estLength = 0;
            for (var i = 0, iEnd = pfr.getEntryCounts(); i<iEnd; i++)
            {
                var mesh = lmv.readGeometry(pfr, i, null /*TODO geom type*/, null, 0, true);
                estLength += ((mesh && mesh.sharedBufferBytes) || 0);
            }

            var sharedBuffer = estLength? new ArrayBuffer(estLength) : null;
            var currentOffset = 0;

            var msg = { "packId": loadContext.packId,
                "workerId" : loadContext.workerId,
                "progress": 1,
                "meshes" : [],
                "sharedBuffer": sharedBuffer
            };

            var transferList = sharedBuffer ? [sharedBuffer] : [];

            for (var i = 0, iEnd = pfr.getEntryCounts(); i<iEnd; i++)
            {
                var mesh = lmv.readGeometry(pfr, i, null /*TODO geom type*/, sharedBuffer, currentOffset);

                if (mesh) {
                    currentOffset += (mesh.sharedBufferBytes || 0);
                    msg.meshes[i] = mesh;
                } else {
                    // it doesn't make much sense to raise an error for each entry that can't
                    // be read, because chances are they will all be unreadable after the
                    // first bad one.
                    if (!raisedError) {
                        _this.raiseError(
                            av.ErrorCodes.BAD_DATA, "Unable to load geometry",
                            { "url": loadContext.url });
                        raisedError = true;
                    }

                    // in this case, we still post the full message instead of just null;
                    // the mesh itself will be null, of course.
                    _this.postMessage(msg);
                }
            }

            _this.postMessage(msg, transferList);
        });

    }

    avp.ViewingService.getItem(loadContext, loadContext.url, onSuccess, loadContext.onFailureCallback);

}

lmv.doGeomLoad = doGeomLoad;

})();


(function() {

"use strict";

var av = Autodesk.Viewing,
    avp = av.Private;
var lmv = Autodesk.LMVTK;


function guardFunction(loadContext, func)
{
    try {
        func();
    }
    catch (exc) {
        loadContext.worker.raiseError(
            av.ErrorCodes.BAD_DATA, "Unhandled exception while loading SVF",
            { "url": loadContext.url, "exception": exc.toString(), "stack": exc.stack });
        loadContext.worker.postMessage(null);
    }
}

function doLoadSvfContinued(loadContext)
{
    var _this = loadContext.worker;

    guardFunction(loadContext, function(){
        var svf = loadContext.svf;
        function loadDoneCallback(type, meshMessage) {
            if (type == "svf") {

                var msg, xfer;
                var frags = svf.fragments;
                var transferable = [
                    frags.transforms.buffer,
                    frags.packIds.buffer,
                    frags.entityIndexes.buffer,
                    frags.fragId2dbId.buffer
                ];

                if (svf.bvh) {
                    // BVH is posted together with svf,
                    // so can add more buffer to transfer.
                    xfer = {
                        nodes: svf.bvh.nodes.getRawData(),
                        primitives: svf.bvh.primitives,
                        useLeanNodes: (svf.bvh.nodes.bytes_per_node == 32)
                    };
                    transferable.push(xfer.nodes);
                    transferable.push(xfer.primitives.buffer);

                    // Then can safely transfer following buffers from fragments.
                    transferable.push(frags.boxes.buffer);
                    transferable.push(frags.polygonCounts.buffer);
                    transferable.push(frags.materials.buffer);

                    msg = { "svf" : svf, "bvh" : xfer, progress: 1.0 };
                }
                else {
                    msg = { "svf" : svf, progress: 0.8 };
                }

                _this.postMessage(msg, transferable);
            } else if (type == "bvh") {
                xfer = {
                    nodes: svf.bvh.nodes.getRawData(),
                    primitives: svf.bvh.primitives,
                    useLeanNodes: (svf.bvh.nodes.bytes_per_node == 32)
                };

                _this.postMessage( { "bvh" : xfer, basePath: svf.basePath, progress: 1.0 },
                                    [xfer.nodes, xfer.primitives.buffer] );

            } else if (type == "mesh") {

                var transferList = [];
                if (meshMessage.mesh)
                    transferList.push(meshMessage.mesh.vb.buffer);

                _this.postMessage(meshMessage, transferList);

            } else if (type == "done") {
                _this.postMessage( { progress: 1.0 } );
            }
            else {
                _this.raiseError(
                    av.ErrorCodes.BAD_DATA, "Failure while loading SVF",
                    { "url": loadContext.url });
                _this.postMessage(null);
            }
        }

        loadContext.loadDoneCB = loadDoneCallback;

        svf.loadRemainingSvf(loadContext);
    });
}

function doLoadSvf(loadContext) {

    var _this = loadContext.worker;

    _this.postMessage({progress:0.01}); //Tell the main thread we are alive

    var type = "svf";
    var url = loadContext.url.toLocaleLowerCase();
    if (url.lastIndexOf(".gltf") === url.length - 5)
        type = "gltf";
    if (url.lastIndexOf(".glb") === url.length - 4)
        type = "glb";

    function onSuccess(result) {

        _this.postMessage({progress:0.5}); //rough progress reporting -- can do better

        guardFunction(loadContext, function() {

            var svf;
            if (type === "gltf" || type === "glb") {
                // result is json
                svf = new lmv.GltfPackage(result);
            } else {
                // result is arraybuffer
                svf = new lmv.Package(new Uint8Array(result));
            }
            loadContext.svf = svf;
            svf.loadManifest(loadContext);


            if(loadContext.interceptManifest) {
                _this.postMessage({"manifest" : svf.manifest});
            } else {
                loadContext.manifest = svf.manifest;
                doLoadSvfContinued(loadContext);
            }
        });
    }

    var options = {
        responseType: (type === "gltf") ? "json" : "arraybuffer"
    };
    avp.ViewingService.getItem(loadContext, loadContext.url, onSuccess, loadContext.onFailureCallback, options);

    //Prefetch the first geometry pack (we assume there is one), to mask some latency
    //We intentionally ignore any errors here.
    avp.ViewingService.getItem(loadContext, loadContext.basePath + "0.pf", function(){}, function(){}, options);

}

lmv.doLoadSvf = doLoadSvf;
lmv.doLoadSvfContinued = doLoadSvfContinued;

})();

(function() {

"use strict";

var lmv = Autodesk.LMVTK;
var av = Autodesk.Viewing,
    avp = av.Private;

function loadPropertyPacks(loadContext, dbId, onPropertyPackLoadComplete) {

    if (loadContext.worker.propdb) {
        onPropertyPackLoadComplete(loadContext.worker.propdb);
        return;
    }

    if (loadContext.worker.propdbFailed) {
        onPropertyPackLoadComplete(null);
        return;
    }

    var dbfiles = loadContext.propertydb;
    if (!dbfiles) {
        loadContext.worker.propdbFailed = true;
        onPropertyPackLoadComplete(null);
        return;
    }

    var loadedDbFiles = {
        ids : {},
        attrs : {},
        offsets : {},
        values: {},
        avs: {}
    };

    //Get the property files
    //TODO: If we start sharding, this has to fetch property file chunk corresponding to the database ID
    //we need the properties for
    var filesToRequest = [];
    filesToRequest.push({filename: dbfiles.attrs.length ? dbfiles.attrs[0] : "objects_attrs.json.gz", storage: loadedDbFiles.attrs});
    filesToRequest.push({filename: dbfiles.values.length ? dbfiles.values[0] : "objects_vals.json.gz", storage: loadedDbFiles.values});
    filesToRequest.push({filename: dbfiles.avs.length ? dbfiles.avs[0] : "objects_avs.json.gz", storage: loadedDbFiles.avs});
    filesToRequest.push({filename: dbfiles.offsets.length ? dbfiles.offsets[0] : "objects_offs.json.gz", storage: loadedDbFiles.offsets});
    filesToRequest.push({filename: dbfiles.ids.length ? dbfiles.ids[0] : "objects_ids.json.gz", storage: loadedDbFiles.ids});

    //Revit outputs backslashes in the
    //relative path. Until this is fixed on the
    //translation side, we have to handle it here.
    for (var i = 0; i < filesToRequest.length; i++) {
        filesToRequest[i].filename = filesToRequest[i].filename.replace(/\\/g, "/");
    }

    //TODO: The section below is temporarily there for AutoCAD, which
    //neither lists property db files in a manifest anywhere, nor compresses
    //them to .gz format so that the code above works... So we do a last
    //attempt to request non-compressed json files.
    var triedUncompressed = false;
    function getUncompressedFiles() {
        var uncompressedFilesToRequest = [];
        uncompressedFilesToRequest.push({filename: "objects_attrs.json", storage: loadedDbFiles.attrs});
        uncompressedFilesToRequest.push({filename: "objects_vals.json", storage: loadedDbFiles.values});
        uncompressedFilesToRequest.push({filename: "objects_avs.json", storage: loadedDbFiles.avs});
        uncompressedFilesToRequest.push({filename: "objects_offs.json", storage: loadedDbFiles.offsets});
        uncompressedFilesToRequest.push({filename: "objects_ids.json", storage: loadedDbFiles.ids});
        return uncompressedFilesToRequest;
    }

    var filesRemaining = filesToRequest.length;
    var filesFailed = 0;

    function onRequestCompletion(data) {

        filesRemaining--;

        if (!data)
            filesFailed++;

        // If all of the files we've requested have been retrieved, create the
        // property database.  Otherwise, request the next required file.
        //
        if (!filesRemaining) {
            if (filesFailed) {
                // When the file request is complete and there's no data, this means
                // that it failed.  Try requesting the uncompressed files, if we haven't
                // already.  If we have, remember that it failed and don't request any
                // more files.
                if (triedUncompressed) {
                    loadContext.worker.propdbFailed = true;
                    onPropertyPackLoadComplete(null);
                    return;
                } else {
                    //Give it another go with uncompressed file names
                    //This will only be the case for very old legacy LMV data.
                    triedUncompressed = true;
                    filesToRequest = getUncompressedFiles();
                    filesRemaining = filesToRequest.length;
                    filesFailed = 0;

                    filesToRequest.forEach(function(f) {
                        requestFile(f.filename, loadContext, onRequestCompletion, f.storage);
                    });
                }
            } else {
                //Store the property db instance to use in further calls to the same worker
                loadContext.worker.propdb = new lmv.PropertyDatabase(loadedDbFiles);
                onPropertyPackLoadComplete(loadContext.worker.propdb);
                loadContext.worker.propdbFailed = false;
                loadContext.worker.propdbURL = loadContext.url;
            }
        }
    }

    // Request the files.
    //
    filesToRequest.forEach(function(f) {
        requestFile(f.filename, loadContext, onRequestCompletion, f.storage);
    });
};


function requestFile(filename, loadContext, onRequestCompletion, storage) {

    function onFailure(status, statusText, data) {
        // We're explicitly ignoring missing property files.
        if (status !== 404) {
            loadContext.onFailureCallback(status, statusText, data);
        }
        onRequestCompletion(null);
    }

    var url = loadContext.url + filename;
    var onSuccess = function(response)
    {
        storage[filename] = response;
        onRequestCompletion(response);
    };

    avp.ViewingService.getItem(loadContext, url, onSuccess, onFailure);

}


function doPropertyGet(loadContext) {
    var dbId = loadContext.dbId;
    var dbIds = loadContext.dbIds;
    var propFilter = loadContext.propFilter;

    function onPropertyPackLoadComplete(propertyDb) {
        if (propertyDb) {
            if (typeof dbIds !== "undefined") {
                var results = [];
                if (dbIds && dbIds.length) {
                    for (var i=0; i<dbIds.length; i++) {
                        var result = propertyDb.getObjectProperties(dbIds[i], propFilter);
                        if (result)
                            results.push(result);
                    }
                } else { //If dbIds is empty, return results for all objects (i.e. no ID filter)
                    for (var i=1, last=propertyDb.getObjectCount(); i<=last; i++) {
                        var result = propertyDb.getObjectProperties(i, propFilter);
                        if (result)
                            results.push(result);
                    }
                }
                loadContext.worker.postMessage({cbId:loadContext.cbId, result: results});
            } else {
                var result = propertyDb.getObjectProperties(dbId, propFilter);
                loadContext.worker.postMessage({cbId:loadContext.cbId, result: result});
            }
        }
    }

    loadPropertyPacks(loadContext, dbId, onPropertyPackLoadComplete);
};

function computeTreeBBoxes(nodeAccess, dbId, fragBoxes) {

    var idx = nodeAccess.getIndex(dbId);
    var nodeBoxes = nodeAccess.nodeBoxes;

    function traverseChildren(child_dbId, parentDbID, parentIdx) {

        var childIdx = nodeAccess.getIndex(child_dbId);

        //Recurse, then add all child boxes to make this node's box
        computeTreeBBoxesRec(child_dbId, childIdx);

        var box_offset = parentIdx * 6;
        var child_box_offset = childIdx * 6;
        for (var k=0; k<3; k++) {
            if (nodeBoxes[box_offset+k] > nodeBoxes[child_box_offset+k])
                nodeBoxes[box_offset+k] = nodeBoxes[child_box_offset+k];
            if (nodeBoxes[box_offset+k+3] < nodeBoxes[child_box_offset+k+3])
                nodeBoxes[box_offset+k+3] = nodeBoxes[child_box_offset+k+3];
        }
    }

    function traverseFragments(fragId, dbId, idx){
        var frag_box_offset = fragId * 6;
        var box_offset = idx * 6;

        for (var k=0; k<3; k++) {
            if (nodeBoxes[box_offset+k] > fragBoxes[frag_box_offset+k])
                nodeBoxes[box_offset+k] = fragBoxes[frag_box_offset+k];
            if (nodeBoxes[box_offset+k+3] < fragBoxes[frag_box_offset+k+3])
                nodeBoxes[box_offset+k+3] = fragBoxes[frag_box_offset+k+3];
        }
    }

    function computeTreeBBoxesRec(dbId, idx) {

        var box_offset = idx * 6;
        nodeBoxes[box_offset]   = nodeBoxes[box_offset+1] = nodeBoxes[box_offset+2] =  Infinity;
        nodeBoxes[box_offset+3] = nodeBoxes[box_offset+4] = nodeBoxes[box_offset+5] = -Infinity;

        if (nodeAccess.getNumChildren(dbId)) {
            nodeAccess.enumNodeChildren(dbId, traverseChildren, true);
        }

        //Leaf node -- don't think it's possible for a node to have
        //both children and leaf fragments, but we do handle that here.
        if (nodeAccess.getNumFragments(dbId)) {
            nodeAccess.enumNodeFragments(dbId, traverseFragments);
        }

    }


    computeTreeBBoxesRec(dbId, idx);

}


function buildDbIdToFragMap(fragToDbId) {
    var ret = {};
    for (var i= 0, iEnd=fragToDbId.length; i<iEnd; i++) {

        var dbIds = fragToDbId[i];

        //In 2D drawings, a single fragment (consolidation mesh)
        //can contain multiple objects with different dbIds.
        if (!Array.isArray(dbIds)) {
            dbIds = [dbIds];
        }

        for (var j=0; j<dbIds.length; j++) {
            var dbId = dbIds[j];
            var frags = ret[dbId];
            if (frags === undefined) {
                //If it's the first fragments for this dbid,
                //store the index directly -- most common case.
                ret[dbId] = i;
            }
            else if (!Array.isArray(frags)) {
                //otherwise put the fragments that
                //reference the dbid into an array
                ret[dbId] = [frags, i];
            }
            else {
                //already is an array
                frags.push(i);
            }
        }
    }

    return ret;
}


function doObjectTreeParse(loadContext) {

    var _this = loadContext.worker;

    function onPropertyPackLoadComplete(propertyDb) {
        if(!propertyDb) {
            _this.postMessage({
                cbId: loadContext.cbId,
                error: { instanceTree:null, maxTreeDepth:0 }
            });
            return;
        }

        var dbToFrag;
        if (loadContext.fragToDbId)
            dbToFrag = buildDbIdToFragMap(loadContext.fragToDbId);

        //Find the root object:
        if (!loadContext.worker.rootsDone) {
            loadContext.worker.idroots = propertyDb.findRootNodes();
            loadContext.worker.objCount = propertyDb.getObjectCount();
            loadContext.worker.rootsDone = true;
        }

        var rootId;
        var maxDepth = [0];

        var transferList = [];
        var storage;

        //In the cases of 2D drawings, there is no meaningful
        //object hierarchy, so we don't build a tree.
        var idroots = loadContext.worker.idroots;
        if (idroots && idroots.length)
        {
            storage = new avp.InstanceTreeStorage(propertyDb.getObjectCount(), loadContext.fragToDbId.length);

            if (idroots.length == 1) {
                //Case of a single root in the property database,
                //use that as the document root.
                rootId = idroots[0];
                propertyDb.buildObjectTreeFlat(rootId, 0, dbToFrag, 0, maxDepth, storage);
            }
            else {
                //Case of multiple nodes at the root level
                //This happens in DWFs coming from Revit.
                //Create a dummy root and add all the other roots
                //as its children.
                rootId = 0;
                var childrenIds = [];

                for (var i=0; i<idroots.length; i++) {
                    propertyDb.buildObjectTreeFlat(idroots[i], 0, dbToFrag, 0, maxDepth, storage);
                    childrenIds.push(idroots[i]);
                }

                storage.setNode(0, 0, "", 0, childrenIds, false);
            }

            storage.flatten();
            transferList.push(storage.nodes.buffer);
            transferList.push(storage.children.buffer);

            //Now compute the bounding boxes for instance tree nodes
            if (loadContext.fragBoxes) {
                var nodeAccess = new avp.InstanceTreeAccess(storage, rootId);
                computeTreeBBoxes(nodeAccess, rootId, loadContext.fragBoxes);
                transferList.push(nodeAccess.nodeBoxes.buffer);
            }
        }

        _this.postMessage({ cbId:loadContext.cbId,
                            result : {
                               rootId: rootId,
                               instanceTreeStorage: storage,
                               instanceBoxes: (!!nodeAccess) ? nodeAccess.nodeBoxes : undefined,
                               maxTreeDepth:maxDepth[0],
                               objectCount:loadContext.worker.objCount
                               }
                          }, transferList);
    }

    loadPropertyPacks(loadContext, null, onPropertyPackLoadComplete);
}

function doPropertySearch(loadContext) {

    var _this = loadContext.worker;

    function onPropertyPackLoadComplete(propertyDb) {
        if (propertyDb) {
            var result = propertyDb.bruteForceSearch(loadContext.searchText, loadContext.attributeNames, loadContext.completeInfo);
            _this.postMessage({ cbId:loadContext.cbId, result:result });
        }
    }

    loadPropertyPacks(loadContext, null, onPropertyPackLoadComplete);
}

function doBuildExternalIdMapping(loadContext) {

    var _this = loadContext.worker;

    function onPropertyPackLoadComplete(propertyDb) {
        if (propertyDb) {
            var mapping = propertyDb.getExternalIdMapping();
            _this.postMessage({cbId : loadContext.cbId, result: mapping});
        }
    }

    loadPropertyPacks(loadContext, null, onPropertyPackLoadComplete);
}

lmv.doBuildExternalIdMapping = doBuildExternalIdMapping;
lmv.doPropertyGet = doPropertyGet;
lmv.doPropertySearch = doPropertySearch;
lmv.doObjectTreeParse = doObjectTreeParse;


})();

(function() {

"use strict";

var lmv = Autodesk.LMVTK;

//FUSION SPECIFIC

function doDecompressDelta(loadContext) {

    var _this = loadContext.worker;

    // Step1:decode the compressed data
    var compressData = base64.decode(loadContext.delta);
    compressData = compressData.split('').map(function(e) {
        return e.charCodeAt(0);
    });

    //Step2:decompress the data
    var inflate = new Zlib.Inflate(compressData);
    var output = inflate.decompress();

    //Step3:convert byte array to string
    var json = "";
    for (var i = 0; i < output.length; i++) {
        json += String.fromCharCode(output[i]);
    }

    //Step4:parse scene json
    json = JSON.parse(json);
    _this.postMessage({cbId:loadContext.cbId, index:loadContext.index,res:json});
}

lmv.doDecompressDelta = doDecompressDelta;

})();

(function() {

"use strict";

var av = Autodesk.Viewing;
var lmv = Autodesk.LMVTK;

function tryCatch(_this, f) {
    try {
        f();
    }
    catch (exc) {
        _this.raiseError(
            av.ErrorCodes.BAD_DATA, "",
            { "exception": exc.toString(), "stack": exc.stack });
        _this.postMessage(null);
    }
}

function doParseF2D(loadContext) {

    var _this = loadContext.worker;

    _this.postMessage({progress:0.01}); //Tell the main thread we are alive

    if (loadContext.data) {

        _this.postMessage({progress:0.5}); //rough progress reporting -- can do better

        var f2d = new lmv.F2D(loadContext.metadata, loadContext.manifest, loadContext.basePath, loadContext.f2dLoadOptions);

        loadContext.loadDoneCB = function(success) {

            if (success) {
                var msg = { "f2d" : f2d };
                _this.postMessage(msg );
            }
            else {
                _this.raiseError(av.ErrorCodes.BAD_DATA, "", {});
                _this.postMessage(null);
            }
        };

        tryCatch(_this, function() {
            f2d.load(loadContext, loadContext.data);
        });
    }
    else {
        _this.postMessage(null);
    }
}

function doParseF2DFrame(loadContext) {

    var _this = loadContext.worker;

    var f2d = _this.f2d;

    if (!f2d) {
        _this.postMessage({progress:0.5}); //rough progress reporting -- can do better

        f2d = _this.f2d = new lmv.F2D(loadContext.metadata, loadContext.manifest, loadContext.basePath, loadContext.f2dLoadOptions);

        f2d.F2D_MESH_COUNT_OLD = 0;

        // First post needs to post entire F2D so we can set up bounding boxes, etc.
        var msg = { "f2dframe" : f2d };
        _this.postMessage(msg);
    }

    function loadDoneCallback(success, finalFlush) {
        if (success) {

            if (!f2d.meshes.length && !finalFlush) {
                // No new data coming in.
                // debug("F2D streaming : no new data coming in.");
                return;
            } else {

                var msg = { "f2dframe" : true,
                    "meshes" : f2d.meshes,
                    "baseIndex" : f2d.F2D_MESH_COUNT_OLD,
                    "bbox" : f2d.bbox
                 };

                if (loadContext.finalFrame) {

                    //Add f2d properties which are cumulative and their
                    //final values are not known until the end
                    msg.cumulativeProps = {
                        maxObjectNumber : f2d.maxObjectNumber,
                        viewports : f2d.viewports,
                        clips : f2d.clips,
                        strings: f2d.strings,
                        stringDbIds: f2d.stringDbIds,
                        stringBoxes: f2d.stringBoxes
                    };

                    msg.finalFrame = finalFlush;
                }

                // User transferable objects to pass the array buffers used by mesh without deep copying.
                var transferList = [];
                for (var i = 0, e = f2d.meshes.length; i < e; ++i) {
                    transferList.push(f2d.meshes[i].vb.buffer);
                    transferList.push(f2d.meshes[i].indices.buffer);
                }
                _this.postMessage(msg, transferList);

                f2d.F2D_MESH_COUNT_OLD += f2d.meshes.length;
                f2d.meshes = [];
            }
        }
        else {
            _this.raiseError(
                av.ErrorCodes.BAD_DATA, "",
                {});
            _this.postMessage(null);
        }
    }

    loadContext.loadDoneCB = loadDoneCallback;

    tryCatch(_this, function() {
        f2d.loadFrames(loadContext);
    });
}

lmv.doParseF2D = doParseF2D;
lmv.doParseF2DFrame = doParseF2DFrame;


})();


(function() {

"use strict";

var av = Autodesk.Viewing,
    avp = av.Private;
var lmv = Autodesk.LMVTK;


var ENABLE_F2D_STREAMING_MODE = true;

function requestFileF2D(loadContext, filename, onSuccess) {
    var url = loadContext.basePath + filename;
    avp.ViewingService.getItem(loadContext, url, onSuccess, null);
}


// Stream loading f2d data and prepare parseable data frames.
function doStreamF2D(loadContext) {

    var _this = loadContext.worker;

    _this.postMessage({progress:0.01}); //Tell the main thread we are alive

    //Get the metadata and manifest first.
    var metadata;
    var manifest;
    var doneFiles = 0;

    requestFileF2D(loadContext, "metadata.json.gz", function(data) {
        try {
            metadata = JSON.parse(lmv.utf8ArrayToString(data));
            doneFiles++;
        } catch (e) {
            self.raiseError(
                av.ErrorCodes.BAD_DATA,
                "" /* does not matter what strings we put here since the final user facing error message is solely decided
                by ErrorCodes. Invent another code if we want a specific error message for this error. */
            );
        }

        if (doneFiles === 2)
            doStreamF2D_Continued(loadContext, manifest, metadata);
    });
    requestFileF2D(loadContext, "manifest.json.gz", function(data) {
        try {
            if (data)
                manifest = JSON.parse(lmv.utf8ArrayToString(data));
            //The F2D does not necessarily need a manifest file to load (some old F2Ds don't have that)
            doneFiles++;
        } catch (e) {}

        if (doneFiles === 2)
            doStreamF2D_Continued(loadContext, manifest, metadata);
    });
}

//Loads the F2D stream once the metadata and manifest files are fetched
function doStreamF2D_Continued(loadContext, manifest, metadata) {

    var _this = loadContext.worker;

    var url = loadContext.url;

    // Collect asset urls that to be send to main thread for mobile usage.
    var assets = [];

    var f2dSize;
    if (manifest && manifest.assets) {
        var a = manifest.assets;
        for (var i=0; i<a.length; i++) {
            if (url.indexOf(a[i].URI) != -1) {
                f2dSize = a[i].usize || 0;
                break;
            }
        }
    }

    var probe = new lmv.F2DProbe();

    var first = true;
    var accumulatedStream = new Uint8Array(65536);
    var accumulatedBytes = 0;
    var streamOffset = 0;
    var sentMetadata = false;

    function onSuccess(responseData) {
        // Send collected f2d resource urls to main thread.
        _this.postMessage({"type" : "F2DAssetURL", "urls" : assets});
        assets = null;

        if (ENABLE_F2D_STREAMING_MODE) {

            var  msg = {
                "type" : "F2DSTREAM",
                "finalFrame" : true,
                "finished" : true,
                "progress" : 1
            };

            if (!sentMetadata) {
                msg.manifest = manifest;
                msg.metadata = metadata;
                msg.basePath = loadContext.basePath;
                sentMetadata = true;
            }

            _this.debug("Total text bytes count : " + responseData.length);

            _this.postMessage(msg);

            //Streaming code path ends here -- we have already sent
            //the data back from the progress callback
            return;
        }

        //Non-streaming code path here
        if (accumulatedStream.length > accumulatedBytes)
            accumulatedStream = new Uint8Array(accumulatedStream.buffer.slice(0, accumulatedBytes));

        var view;
        if (accumulatedStream[0] == 31 && accumulatedStream[1] == 139) {
            try {
                view = new Uint8Array(accumulatedStream.buffer, 0, accumulatedBytes);
                view = new Zlib.Gunzip(view).decompress();
            } catch (e) {

            }
        }

        var msg = { "type" : "F2DBLOB",
            "metadata" : metadata,
            "manifest" : manifest,
            "basePath" : loadContext.basePath, // TODO: we might be able to infer this elsewhere.
            "progress" : 1,
            "buffer" : view.buffer};
        var transferList = [];
        transferList.push(view.buffer);
        _this.postMessage(msg, transferList);
    }

    function onData(partial) {

        //Add the new bytes to the accumulation buffer
        if (accumulatedStream.length < partial.length + accumulatedBytes) {
            var newlen = Math.max(accumulatedStream.length * 2, partial.length + accumulatedBytes);
            var ns = new Uint8Array(newlen);
            ns.set(accumulatedStream);
            accumulatedStream = ns;
        }
        accumulatedStream.set(partial, accumulatedBytes);
        accumulatedBytes += partial.length;

        if (!ENABLE_F2D_STREAMING_MODE)
            return;

        if (first) {
            first = false;

            // If the very first two bytes of the entire stream is GZIP magic number,
            // then we fall back on none streaming mode, because streaming mode only
            // work with browser decompression, and the presence of such magic number
            // implies browser decompression fails, for whatever reasons.
            if (accumulatedStream[0] == 31 && accumulatedStream[1] == 139) {
                avp.logger.error("F2D streaming broken by non-streaming unzip!");
                ENABLE_F2D_STREAMING_MODE = false;
                return;
            }
        }

        var view = new Uint8Array(accumulatedStream.buffer, streamOffset, accumulatedBytes - streamOffset);

        try {
            var marker = probe.load(view);

            if (marker.frameEnd > marker.frameStart) {
                var frames = accumulatedStream.buffer.slice(streamOffset + marker.frameStart, streamOffset + marker.frameEnd);
                streamOffset += marker.frameEnd;

                var transferList = [];
                transferList.push(frames);

                var msg = { "type" : "F2DSTREAM",
                    "frames" : frames,
                    "finalFrame" : false
                };

                if (f2dSize)
                    msg.progress = streamOffset / f2dSize;

                if (!sentMetadata) {
                    msg.manifest = manifest;
                    msg.metadata = metadata;
                    msg.basePath = loadContext.basePath;
                    sentMetadata = true;
                }

                _this.postMessage(msg, transferList);

            }
        } catch (e) {
            debug(e);
        }
    }

    avp.ViewingService.getItem(loadContext, url, onSuccess, loadContext.onFailureCallback, {
        ondata: onData,
        responseType: ""
    });

}


lmv.doStreamF2D = doStreamF2D;

})();


var av = Autodesk.Viewing;

/**
 * Error code constants
 *
 * These constants will be used in onErrorCallbacks.
 *
 * @enum {number}
 * @readonly
 */
av.ErrorCodes = {
    /** An unknown failure has occurred. */
    UNKNOWN_FAILURE: 1,

    /** Bad data (corrupted or malformed) was encountered. */
    BAD_DATA: 2,

    /** A network failure was encountered. */
    NETWORK_FAILURE: 3,

    /** Access was denied to a network resource (HTTP 403) */
    NETWORK_ACCESS_DENIED: 4,

    /** A network resource could not be found (HTTP 404) */
    NETWORK_FILE_NOT_FOUND: 5,

    /** A server error was returned when accessing a network resource (HTTP 5xx) */
    NETWORK_SERVER_ERROR: 6,

    /** An unhandled response code was returned when accessing a network resource (HTTP 'everything else') */
    NETWORK_UNHANDLED_RESPONSE_CODE: 7,

    /** Browser error: webGL is not supported by the current browser */
    BROWSER_WEBGL_NOT_SUPPORTED: 8,

    /** There is nothing viewable in the fetched document */
    BAD_DATA_NO_VIEWABLE_CONTENT: 9,

    /** Browser error: webGL is supported, but not enabled */
    BROWSER_WEBGL_DISABLED: 10,

    /** There is no geomtry in loaded model */
    BAD_DATA_MODEL_IS_EMPTY: 11,

    /** Collaboration server error */
    RTC_ERROR: 12

};

(function() {

var lmv = Autodesk.LMVTK;
var av = Autodesk.Viewing,
    avp = av.Private;

// Fall back to console logging in workers
avp.logger = avp.logger || console;

avp.workerMain = function(loadContext) {

    if(!loadContext.hasOwnProperty('operation')) {
        return;
    }

    //Initialize the path that contains the requested
    //file. It's the root for other relative paths referenced
    //by the base file.
    loadContext.basePath = "";
    if (loadContext.url) {
        var lastSlash = loadContext.url.lastIndexOf("/");
        if (lastSlash != -1)
            loadContext.basePath = loadContext.url.substr(0, lastSlash+1);
    }

    // Create the default failure callback.
    //
    loadContext.raiseError = function() {
        loadContext.worker.raiseError.apply(loadContext.worker, arguments);
    };
    loadContext.onFailureCallback = avp.ViewingService.defaultFailureCallback.bind(loadContext);

    var op = loadContext.operation;
    switch (op) {

        case "LOAD_GEOMETRY":       lmv.doGeomLoad(loadContext);          break;
        case "LOAD_SVF":            lmv.doLoadSvf(loadContext);           break;
        case "LOAD_SVF_CONTD":      lmv.doLoadSvfContinued(loadContext);  break;
        case "GET_PROPERTIES":      lmv.doPropertyGet(loadContext);       break;
        case "SEARCH_PROPERTIES":   lmv.doPropertySearch(loadContext);    break;
        case "BUILD_EXTERNAL_ID_MAPPING": lmv.doBuildExternalIdMapping(loadContext); break;
        case "GET_OBJECT_TREE":     lmv.doObjectTreeParse(loadContext);   break;
        case "PARSE_F2D":           lmv.doParseF2D(loadContext);          break;
        case "PARSE_F2D_FRAME":     lmv.doParseF2DFrame(loadContext);     break;
        case "STREAM_F2D":          lmv.doStreamF2D(loadContext);         break;
        case "DECOMPRESS_DELTA":    lmv.doDecompressDelta(loadContext);   break; //FUSION_SPECIFIC
        case "POPULATE_CACHE":      lmv.doPopulateCache(loadContext);     break;
        case "DECODE_ENVMAP":       lmv.doDecodeEnvmap(loadContext);      break;
    }

}


})();

var avp = Autodesk.Viewing.Private;

/** @define {boolean} */
var ENABLE_OCTM_MG2 = false;

//This magic defines the worker stuff only
//if this javascript is executed in a worker.
//This way we can use a single compacted javascript file
//as both the main viewer and its workers.
//I think of it as fork() on Unix.
var IS_WORKER = (typeof self !== 'undefined') && (typeof window === 'undefined');
if (IS_WORKER)
{

if (!avp.IS_CONCAT_BUILD)
{
    //Everything below will get compiled into the worker JS during build

    importScripts("../AutodeskNamespace.js");
    importScripts("../compatibility.js"); //browser compatibility polyfills, etc.

    importScripts("../../thirdparty/three.js/LmvMatrix4.js"); //Vector math

    //TODO: This means three copies of the inflate algorithm
    //will get included -- we can do a custom build of zlib
    //to avoid this.
    importScripts("../lmvtk/zlib/gunzip.min.js"); //For RAW compressed pack files
    importScripts("../lmvtk/zlib/unzip.min.js"); //for SVF packages
    importScripts("../lmvtk/zlib/inflate.min.js"); //FUSION SPECIFIC
    importScripts("../lmvtk/fusion/base64.js"); //FUSION SPECIFIC

    //MG2 compression -- disabled by default.
    if (ENABLE_OCTM_MG2) {
        importScripts("../lmvtk/zlib/inflate.min.js"); //for OCTM MG2 compression
        importScripts("../lmvtk/svf/octm_mg2.js"); //for OCTM MG2 compression
    }

    importScripts("../scene/BVHBuilder.js");
    importScripts("../scene/InstanceTreeStorage.js");
    importScripts("../lmvtk/common/InputStream.js");
    importScripts("../lmvtk/common/VbUtils.js");
    importScripts("../lmvtk/common/VertexBufferBuilder.js");
    importScripts("../lmvtk/svf/PackReader.js");
    importScripts("../lmvtk/svf/Geoms.js");
    importScripts("../lmvtk/svf/Lights.js");
    importScripts("../lmvtk/svf/Cameras.js");
    importScripts("../lmvtk/svf/Fragments.js");
    importScripts("../lmvtk/svf/Instances.js");
    importScripts("../lmvtk/svf/Package.js");
    importScripts("../lmvtk/svf/PackReader.js");
    importScripts("../lmvtk/common/Propdb.js");
    importScripts("../lmvtk/f2d/F2d.js");
    importScripts("../lmvtk/f2d/F2dProbe.js");
    importScripts("../lmvtk/f2d/CheckedInputStream.js");
    importScripts("../net/Xhr.js");
    importScripts("GeomWorker.js");
    importScripts("SvfWorker.js");
    importScripts("PropWorker.js");
    importScripts("DecompressWorker.js");
    importScripts("F2dParseWorker.js");
    importScripts("F2dStreamWorker.js");
    importScripts("PopulateCacheWorker.js");

    // TODO: Look into moving these out
    importScripts("../ErrorCodes.js");

    importScripts("MainWorker.js");
}

//Web worker dispatcher function -- received a message
//from the main thread and calls the appropriate handler
self.addEventListener('message', function(e) {

    var loadContext = e.data;
    loadContext.worker = self;

    avp.workerMain(loadContext);

}, false);


self.raiseError = function(code, msg, args) {
    self.postMessage({ "error": { "code": code, "msg": msg, "args": args }});
};

// Shared by all workers to output debug message on console of main thread.
function debug(msg) {
//    self.postMessage({debug : 1, message : msg});
}

self.debug = debug;

} //IS_WORKER
