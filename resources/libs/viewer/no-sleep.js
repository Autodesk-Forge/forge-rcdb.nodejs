(function(global) {

	function NoSleep() {
		this._video = document.createElement('video');
		//window.addEventListener('touchstart', this.enable.bind(this));
	};

	NoSleep.prototype.enable = function() {
		this._video.src = 'no-sleep.webm';
		this._video.play();
	};

	NoSleep.prototype.disable = function() {
		this._video.pause();
		this._video.src = '';
	};

	global.NoSleep = NoSleep;

})(this);
