/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function () {

	var _scope = this;

	var _enabled = false;

	var _oldRotationOrder = "";

	var _q = new THREE.Quaternion();	// Tracks orientation

	var _qScreen = new THREE.Quaternion();
	var _qOrient = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

	var _zUp = new THREE.Vector3( 0, 0, 1 );

	var _euler = new THREE.Euler();

	this.deviceOrientation = {};
	this.screenOrientation = window.orientation || 0; // 90,-90 = landscape, 0,180 = portrait

	var onDeviceOrientationChangeEvent = function ( event ) {

		_scope.deviceOrientation = event;

	};

	var getOrientation = function() {
		switch (window.screen.orientation || window.screen.mozOrientation) {
		case 'landscape-primary':
			return 90;
		case 'landscape-secondary':
			return -90;
		case 'portrait-secondary':
			return 180;
		case 'portrait-primary':
			return 0;
		}

		// this returns 90 if width is greater then height
		// and window orientation is undefined OR 0
		// if (!window.orientation && window.innerWidth > window.innerHeight)
		//   return 90;
		return window.orientation || 0;
	};

	var onScreenOrientationChangeEvent = function() {

		_scope.screenOrientation = getOrientation();

	};

	this.connect = function() {

		onScreenOrientationChangeEvent(); // run once on load

		window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		_enabled = true;

	};

	this.disconnect = function() {

		_enabled = false;

		window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );
	};

	// Returns a Quaternion containing current orientation
	this.update = function () {

		if ( _enabled === false )
			return null;

		// Y-up coordinate system with portrait the default for a mobile device.
		// If device rotated then need to handle.

		// alpha: rotation around z-axis, 0 = north, increasing as rotated CCW
		var alpha = _scope.deviceOrientation.alpha ? THREE.Math.degToRad( _scope.deviceOrientation.alpha ) : 0; // Z
		// gamma: left to right, -90 to left, 0 = level, 90 to right
		var beta  = _scope.deviceOrientation.beta  ? THREE.Math.degToRad( _scope.deviceOrientation.beta  ) : 0; // X'
		// beta: front back motion, -180 tilt up, 0 = level, 180 = tilt down
		var gamma = _scope.deviceOrientation.gamma ? THREE.Math.degToRad( _scope.deviceOrientation.gamma ) : 0; // Y''

		var orient = _scope.screenOrientation      ? THREE.Math.degToRad( _scope.screenOrientation       ) : 0; // orientation 0,90,-90,180

		// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''
		_euler.set( beta, alpha, -gamma, 'YXZ' );             		// 'ZXY' for the device, but need 'YXZ'
		_q.setFromEuler( _euler );                              	// orient the device
		_q.multiply( _qOrient );                                    // camera looks out the back of the device, not the top
		_q.multiply( _qScreen.setFromAxisAngle( _zUp, - orient ) );	// adjust for screen orientation

		return _q;
	};

	this.connect();

};
