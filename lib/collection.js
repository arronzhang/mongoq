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
, cursor = require("./cursor")
, slice = Array.prototype.slice
, STATE_CLOSE = 0
, STATE_OPENNING = 1
, STATE_OPEN = 2;

/**
* Mongoq collection class
*
* @param {String} name
* @param {Server} server
* @param {Object} options
*
* @api public
*
*/

module.exports = collection;
function collection(name, db, options) {
	var self = this;
	EventEmitter.call(self);
	self.setMaxListeners( 0 ); //Disable max listener warning...
	self.name = name;
	self.db = db;
	self._options = options || {};
	self.state = STATE_CLOSE;

	self.internalHint;
	self.__defineGetter__('hint', function() { return this.internalHint; });
	self.__defineSetter__('hint', function(value) {
		this.internalHint = value;
		this.open(function(err, original) {
			if (original) {
				original.hint = value;
				self.internalHint = original.hint;
			}
		});
	});
}

/**
* Enable events
*/

inherits( collection, EventEmitter );


/**
* Inherits mongodb.Db methods
*
* insert (docs, options?, callback?) //=> this
* checkCollectionName (collectionName) // Throw error is not valid
* remove (selector?, options?, callback?) 
* rename (newName, callback) 
* insertAll (docs, options?, callback?) 
* save (doc, options?, callback?) //=> undefined
* update (selector, document, options?, callback?) //  options:upsert,multi,safe
* distinct (key, query?, callback?) 
* count (query?, callback?)
* drop (callback) 
* findAndModify (query, sort, doc, options?, callback?) // options: remove,unshift,new
* find () //=> Cursor or undefined if callback
* normalizeHintField (hint) // Get 
* findOne (queryObject, options?, callback) 
* createIndex (fieldOrSpec, options, callback?)
* ensureIndex (fieldOrSpec, options, callback?)
* indexInformation (options, callback)
* dropIndex (name, callback)
* dropIndexes (callback)
* mapReduce (map, reduce, options, callback)
* group (keys, condition, initial, reduce, command, callback)
* options (callback)
*
*/

var getters = []
, ignores = ["find", "drop", "normalizeHintField", "checkCollectionName"];
util.extend( collection, mongodb.Collection, getters, ignores, "original" );


/**
* Open collction
*
* @param {Function} callback
* @return {Collection}
* @api public
*
*/

collection.prototype.open = function( callback ) {
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
		self.db.open(function(err, original) {
			if (err) {
				return fail( err );
			}
			self.db.original.createCollection(self.name, self._options, function(err, original) {
				err ? fail( err ) : done( original );
			});
		});

	}
	function done (original) {
		self.state = STATE_OPEN;
		self.original = original;
		if( self.hint ) original.hint = self.hint;
		self.emit("open", null, self.original);
	}
	function fail (err) {
		self.state = STATE_CLOSE;
		self.emit("open", err, self.original);
	}
}

collection.prototype.close = function() {
	this.state = STATE_CLOSE;
}

collection.prototype.drop = function(callback) {
	this.db.dropCollection(this.name, callback);
	this.close();
	return this;
}


/**
* Find
*
* @return {Cursor}
* @api public
*
*/

collection.prototype.find = function() {
	return new cursor(null, this, slice.call(arguments, 0));
}

/**
*
* Find items == find().toArray()
*
* @return {Collection}
* @api public
*
*/

collection.prototype.findItems = function() {
	var args = util.parseArgs( arguments );
	this.find(args.clean).toArray(args.callback);
	return this;
}
