"use strict";

var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var tabs = require("sdk/tabs");
var ss = require("sdk/simple-storage");
var notifications = require("sdk/notifications");

var button = ToggleButton({
	id: "highlightorBtn",
	label: "Highlightor",
	icon: {
		"16": "./img/icon16.png",
		"32": "./img/icon32.png",
		"48": "./img/icon48.png",
		"64": "./img/icon64.png",
		"128": "./img/icon128.png",
	},
	onChange: handleChangeToggleButton
});

var panel = panels.Panel({
	width: 200,
	height: 140,
	contentURL: self.data.url("share/panel.html"),
	contentScriptFile: self.data.url("lib/panel.js"),
	onHide: handleHidePanel
});

var hlt = require("./lib/highlightTable.js");
var worker = null;
var curColor = null;
var tabWorkers = {};

/*
 * Function: handleChangeToggleButton(state)
 * Consume an `state` of toggle button 
 * If stage is checked show a panel, otherwise do nothing
 */
function handleChangeToggleButton(state) {
	if (state.checked) {
		panel.show({
			position: button
		});
	}
}

/*
 * Function: handleHidePanel()
 * When hide a panel also change the state of toggle button to false
 */
function handleHidePanel() {
	button.state('window', {checked: false});
};

/*
 * Function: updateStorage(data)
 * Consume an `data` in format 
 * { "address" : "some url", "highlightText" : "serialized text of highlighter"}
 * Add data to highlightTable storage
 */
var updateStorage = function(data) {
	if(!ss.storage.highlightTable){
		ss.storage.highlightTable = new hlt.HighlightTable({});
	}
	ss.storage.highlightTable.addUrl(data.address, data.highlightText);
};

/*
 * Function: cleanCurrentPage(address)
 * Consume an `address` 
 * Remove highlightTable storage that related to the address
 */
var cleanCurrentPage = function(address) {
	if(ss.storage.highlightTable && ss.storage.highlightTable.hasAddress(address)){
		ss.storage.highlightTable.removeAddress(address);
	}
};

/*
 * Function: getTabWorker(tab)
 * Consume an `tab` 
 * Find the worker that associated with the tab base on tab id
 */
var getTabWorker = function(tab) {
	if(tab){
    	return tabWorkers[tab.id];
	}
	return null;
}

/*
 * Function: getTabWorker(tab)
 * Consume an `tab` 
 * Remove the worker that associated with the tab base on tab id
 */
var removeTabWorker = function(tab) {
	if(getTabWorker(tab) == worker) {
		delete tabWorkers[tab.id];
	}
};

/*
 * Function: updateHighlightColor(color)
 * Consume an `color` 
 * Update curColor from color picker and send update to all avaliable tab woker
 */
var updateHighlightColor = function(color) {
	curColor = color;
	for (let tab of tabs){
		tabWorkers[tab.id].port.emit("changeColor", color);
	}
};

/*
 * Listen to color picker change from the panel
 */
panel.port.on("pickColor", function(color) {
	updateHighlightColor(color);
	panel.hide();
});

/*
 * Listen to clean current page highlighter from the panal
 */
panel.port.on("cleanCurrentPage", function() {
	cleanCurrentPage(tabs.activeTab.url);
	tabWorkers[tabs.activeTab.id].port.emit("cleanHighlightor");
	panel.hide();
});

/*
 * Listen to clean all highlighter from the panal
 */
panel.port.on("cleanAll", function() {
	if(ss.storage.highlightTable){
		ss.storage.highlightTable.clear();
		tabWorkers[tabs.activeTab.id].port.emit("cleanHighlightor");
		panel.hide();
	}
});

/*
 * Handle tab ready event
 */
tabs.on('ready', function(tab) {
	worker = tabWorkers[tab.id] = tab.attach({
		contentScriptFile: [
			self.data.url("lib/TextHighlighter.js"),
			self.data.url("lib/highlightor.js")
		]
	});

	var data = null;
	var address = tab.url;

	if(ss.storage.highlightTable){
		ss.storage.highlightTable = new hlt.HighlightTable(ss.storage.highlightTable.urls);
		if(ss.storage.highlightTable.hasAddress(address)) {
			data = ss.storage.highlightTable.getHighlightInfo(address);
		}
	}

	worker.port.emit("initHighlightor", address, data);
	worker.port.on("updateStorage", updateStorage);

	if(curColor) {
		for (let curTab of tabs){
			tabWorkers[curTab.id].port.emit("changeColor", curColor);
		}
	}
});

/*
 * Handle tab close event
 */
tabs.on('close', removeTabWorker);

/*
 * Handle simple storage over quota
 */
ss.on("OverQuota", function () {
	notifications.notify({
		title: 'Storage space exceeded',
		text: 'Remove old highlightText'
	});
	while (ss.quotaUsage > 1) {
		ss.storage.highlightTable.overQuota();
	}
});