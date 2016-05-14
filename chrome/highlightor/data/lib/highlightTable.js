function HighlightTable(obj){
	this.urls = {};
	this.length = 0;

	/*
	 * Function: hasAddress(address)
	 * Consume an `address` 
	 * If address exists return `true`, otherwise return `false`
	 */
	this.hasAddress = function(address){
		return this.urls.hasOwnProperty(address);
	}

	/*
	 * Function: getHighlightInfo(address)
	 * Consume an `address`
	 * If `address` can be found return the url, otherwise return `undefined
	 */
	this.getHighlightInfo = function(address){
		return this.hasAddress(address) ? this.urls[address] : undefined;
	}

	/*
	 * Function: addUrl(address,info)
	 * Consume an `address` and `info` about the address
	 * If address doesn't exist increase the `length` by 1
	 * Mutate value of the `urls` with `info`
	 */
	this.addUrl = function(address, highlightInfo){
		if(!this.hasAddress(address)){
			this.length++;
		}
		this.urls[address] = highlightInfo;
	}

	/*
	 * Function: removeAddress(address)
	 * Consume an `address`
	 * If an `address` doesn't exists return `false`, otherwise
	 * Mutate the `urls` by deleting the existed address, decreasing 
	 * the `length` by 1, and return `true`
	 */
	this.removeAddress = function(address){
		if(this.hasAddress(address)){
			this.length--;
			delete this.urls[address];
			return true;
		}
		return false;
	}
	
	/*
	 * Function: getAllAddress()
	 * The function returns an array of address in `urls`
	 */
	this.getAllAdress = function(){
		var addresses = [];
		for(var address in this.urls){
			addresses.push(address);
		}
		return addresses;
	}

	/*
	 * Function: getAllHighlightInfo()
	 * The function return an array of highlightInfo in `urls`
	 */
	this.getAllHighlightInfo = function(){
		var highlightInfo = [];
		for (var address in this.urls){
			highlightInfo.push(this.urls[address]);
		}
		return highlightInfo;
	}

	this.clear = function(){
		this.length = 0;
		this.urls = [];
	}

	this.each = function(fn){
		for(var address in this.urls){
			fn(address, this.urls[address]);
		}
	}

	this.overQuota = function() {
		var addresses = this.getAllAdress();
		for(var i=0; i<3; i++) {
			this.removeAddress(addresses[i]);
		}
	}

	for(var property in obj){
		if(!this.hasAddress[property]){
			this.length++;
		}
		this.urls[property] = obj[property];
	}
}