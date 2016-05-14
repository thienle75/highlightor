"use strict";

(function() {
	var hlt = null;
	var hltr = null;
	var curColor = null;
	var xKeyPressed = false;
	var xKeyCode = 88;
	var storage = chrome.storage.local;

	if(document.body) {

		storage.get({ highlightor : null}, function(data) {
			hltr = new TextHighlighter(document.body, {
				onAfterHighlight: function(range, highlights) {
					hlt.addUrl(location.href, hltr.serializeHighlights());
					storage.set({'highlightor': hlt.urls});
				}
			});

			if(data.highlightor) {
				hlt = new HighlightTable(data.highlightor);
				if(hlt.hasAddress(location.href)) {
					hltr.deserializeHighlights(hlt.getHighlightInfo(location.href));
				}
			}
			else {
				hlt = new HighlightTable({});
			}
		});

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
				if(target.classList[0] === "highlighted") {
					hltr.removeHighlights(target);
					hlt.addUrl(location.href, hltr.serializeHighlights());
					storage.set({'highlightor': hlt.urls});
				}
			}
		}, false);
		
	}

	chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
		if (request.message === "colorChange") {
			curColor = request.highlightColor;
			if(hltr) {
				hltr.setColor(curColor);
			}
		}
		else if(request.message === "cleanCurrentPage") {
			if(hlt && hlt.hasAddress(request.url)) {
				hltr.removeHighlights();
				hlt.addUrl(location.href, hltr.serializeHighlights());
				storage.set({'highlightor': hlt.urls});
			}
		}
		else if(request.message === "bigBang") {
			if(hlt) {
				hltr.removeHighlights();
				hlt.clear();
				storage.set({'highlightor': hlt.urls});
			}
		}
		else {
			console.log("Not a valid command");
		}
	});

}());