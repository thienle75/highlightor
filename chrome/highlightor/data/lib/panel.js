var ColorPicker = (function () {
	'use strict';

	var COLORS = [
		'#FFFF7B',
		'#F44336',
		'#8BC34A',
		'#29B6F6'
	];
	var CLASS_SELECTED = 'selected';

	function ColorPicker(el) {
		var self = this;
		this.color = COLORS[0];
		this.selected = null;

		COLORS.forEach(function (color) {
			var div = document.createElement('div');
			div.style.backgroundColor = color;

			if (self.color === color) {
				div.className = CLASS_SELECTED;
				self.selected = div;
			}

			div.addEventListener('click', function () {
				// Temporary fix when popup reload everytime
				// if (color !== self.color) {
				if (true) {
					self.color = color;

					if (self.selected) {
						self.selected.className = '';
					}
					self.selected = div;
					self.selected.className = CLASS_SELECTED;

					if (typeof self.callback === 'function') {
						self.callback.call(self, color);
					}
				}
			}, false);

			el.appendChild(div);
		});
	}

	ColorPicker.prototype.onColorChange = function (callback) {
		this.callback = callback;
	};

	return ColorPicker;
})();

(function () {
	var colors = new ColorPicker(document.querySelector('.color-picker'));
	var cleanBtn = document.getElementById('cleanBtn');
	var bigBangBtn = document.getElementById('bigBangBtn');

	cleanBtn.onclick = function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { message: "cleanCurrentPage", url: tabs[0].url });
		});
		window.close();
	};

	bigBangBtn.onclick = function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { message: "bigBang" });
		});
		window.close();
	};

	colors.onColorChange(function(color) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { message: "colorChange", highlightColor: color });
		});
		window.close();
	});
})();