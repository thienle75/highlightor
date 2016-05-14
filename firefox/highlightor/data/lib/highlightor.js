"use strict";

var hltr = null;

self.port.on("initHighlightor", function(address, data) {
	initHighlightor(address, data);
});

self.port.on("changeColor", function(color) {
	if(hltr && color) {
		hltr.setColor(color);
	}
});

self.port.on("cleanHighlightor", function() {
	if(hltr) {
		hltr.removeHighlights();
	}
});

var initHighlightor = function(address, data) {
	var xKeyPressed = false;
	var xKeyCode = 88;
	
	document.addEventListener('keydown', function(event) {
		xKeyPressed = event.which === xKeyCode;
	}, false);

	document.addEventListener('keyup', function(event) {
		xKeyPressed = false;
	}, false);

	document.addEventListener('click', function(event) {
		if(xKeyPressed) {
			event = event || window.event;
			var target = event.target || event.srcElement;
			if(target.classList[0] === "highlighted"){
				hltr.removeHighlights(target);
				updateHighlight(address, hltr);
			}
		}
	}, false);

	if(!document.body) {
		return;
	}

	hltr = new TextHighlighter(document.body, {
		onAfterHighlight: function(range, highlights) {
			updateHighlight(address, hltr);
		}
	});

	if(data){
		hltr.deserializeHighlights(data);
	}
};

var updateHighlight = function(address, highlighter) {
	var data = { "address" : address, "highlightText" : highlighter.serializeHighlights() };
	self.port.emit("updateStorage", data);
};