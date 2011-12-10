/*!
* Mongoq
*
* Copyright (c) 2011 Hidden
* Released under the MIT, BSD, and GPL Licenses.
*
* Date: 2011-09-11
*/

/**
* Depends
*/

var mongodb = require("mongodb")
, util = require('./util')
, EventEmitter = require("events").EventEmitter
, inherits = require("util").inherits
, slice = Array.prototype.slice
, STATE_CLOSE = 0
, STATE_OPENNING = 1
, STATE_OPEN = 2;

/**
* Mongoq cursor class
*
* @param {Cursor} original
* @param {Collection} collection
* @param {Array} args
*
* @api public
*
*/

module.exports = cursor;
function cursor(original, collection, args) {
	var self = this;
	EventEmitter.call(self);
	self.setMaxListeners( 0 ); //Disable max listener warning...
	self.original = original;
	self.collection = collection;
	self.args = args;
	self.state = STATE_CLOSE;
	if ( !original ) {
		self.state = STATE_CLOSE;
		self.open();
	}else {
		self.state = STATE_OPEN;
	}
}

/**
* Enable events
*/

inherits( cursor, EventEmitter );


/**
* Inherits mongodb.Db methods
*
* rewind()
* toArray(callback)
* each(callback)
* count(callback)
* sort(keyOrList, direction) //=> this
* limit(limit) //=> this
* skip(limit) //=> this
* batchSize(limit) //=> this
* limitRequest// get
* generateQueryCommand
* formattedOrderClause
* formatSortValue
* nextObject(callback)
* getMore(callback)
* explain(callback)
* streamRecords
* close
* isClosed
*
*/

var getters = ["isClosed", "limitRequest"]
, setters = ["sort", "limit", "skip", "batchSize"]
, ignores = ["rewind", "generateQueryCommand", "formattedOrderClause", "formatSortValue", "streamRecords", "close"];
util.extend( cursor, mongodb.Cursor, getters, ignores, "original", setters );


/**
* Open collction
*
* @param {Function} callback
* @return {Curor}
* @api public
*
*/

cursor.prototype.open = function( callback ) {
	var self = this;
	switch ( this.state ) {
		case STATE_OPEN:
			callback && callback.call(self, null, self.original); break;
		case STATE_OPENNING:
			callback && self.once('open', callback); break;
		case STATE_CLOSE:
			default:
				callback && self.once('open', callback); open(); 
	}
	return this;
	function open() {
		self.state = STATE_OPENNING;
		self.collection.open(function(err, collection) {
			err ? fail( err ) : done( collection );
		});
	}

	function parseArgs () {
		var args = self.args || []
		, len = self.args.length - 1
		, callback = ( 'function' === typeof args[len] ) && args[len];
		if (callback) {
			self.once('open', callback);
			args.pop();
		}
		return args;
	}
	function done ( collection ) {
		self.state = STATE_OPEN;
		var args = parseArgs();

		self.original = collection.find.apply(collection, args);
		self.emit("open", null, self.original);
	}
	function fail (err) {
		self.state = STATE_CLOSE;
		var args = parseArgs();
		self.emit("open", err);
	}
}

