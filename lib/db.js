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
, collection = require("./collection")
, slice = Array.prototype.slice
, STATE_CLOSE = 0
, STATE_OPENNING = 1
, STATE_OPEN = 2;

/**
* Mongoq db class
*
* @param {String} name
* @param {Server} server
* @param {Object} options
*
* @api public
*
*/

module.exports = db;
function db(name, server, options) {
	var self = this;
	EventEmitter.call(self);
	self.setMaxListeners( 0 ); //Disable max listener warning...
	self.name = name;
	self.server = server;
	self._collections = {};
	self.options = options || {};
	self.state = STATE_CLOSE;
	self.original = new mongodb.Db(this.name, this.server, this.options);
	//Fixed emission of `error` event resulting in an uncaught exception
	self.on('error', function(){});
	// Inherits db events [error,close,timeout]
	["error", "close", "timeout"].forEach(function(event) {
		self.original.on(event, function() {
			//Close all collections
			for( var key in self._collections ) {
				self._collections[key].close();
			}
			//Close connect when error
			self.state = STATE_CLOSE; 
			var args = slice.call(arguments, 0); 
			args.unshift(event);
			self.emit.apply(self, args);
		});
	});


}

/**
* Enable events
*/

inherits( db, EventEmitter );


/**
* Inherits mongodb.Db methods
*
* open (callback) 
* close (callback) 
* admin (callback)
* collectionsInfo (collectionName, callback)
* collectionNames (collectionName, callback)
* collection (collectionName, options, callback)
* collections (callback)
* eval (code, parameters, callback)
* dereference (dbRef, callback)
* logout (options, callback)
* authenticate (username, password, callback)
* addUser (username, password, callback)
* removeUser (username, callback)
* createCollection (collectionName, options, callback)
* command (selector, callback)
* dropCollection (collectionName, callback)
* renameCollection (fromCollection, toCollection, callback)
* lastError (options, connectionOptions, callback)
* error (options, callback)
* lastStatus (callback)
* previousErrors (callback)
* executeDbCommand (commandHash, options, callback) 
* executeDbAdminCommand (commandHash, callback)
* resetErrorHistory (callback)
* createIndex (collectionName, fieldOrSpec, options, callback)
* ensureIndex (collectionName, fieldOrSpec, options, callback)
* cursorInfo (callback)
* dropIndex (collectionName, indexName, callback) 
* indexInformation (collectionName, options, callback)
* dropDatabase (callback)
* executeCommand (dbCommand, options, callback)
* wrap
*
*/

var getters = [] //admin
, ignores = ["wrap", "collectionsInfo", "open", "close", "collection"];

util.extend( db, mongodb.Db, getters, ignores, "original" );


/**
* Open database
*
* @param {Function} callback
* @return {Db}
* @api public
*
*/

db.prototype.open = function( callback ) {
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
		self.original.open(function(err, original) {
			if( err ) {
				return fail(err);
			} 
			if( self.options.username ) {
				self.original.authenticate(self.options.username, self.options.password, function(err, success){
					//Sign for check
					self.isAuthenticate = true;
					err = success ? err: new Error('Could not authenticate user ' + self.options.username);
					err ? fail(err) : done();
				});
			} else {
				done();
			}
		});

	}
	function done () {
		self.state = STATE_OPEN;
		self.emit("open", null, self.original);
	}
	function fail (err) {
		self.state = STATE_CLOSE;
		self.emit("open", err, self.original);
	}
}

/**
* Close database
*
* @param {Function} callback
* @return {Db}
* @api public
*
*/

db.prototype.close = function(callback) {
	var self = this;
	//Close collections
	for( var key in self._collections ) {
		self._collections[key].close();
	}
	switch ( this.state ) {
		case STATE_OPEN:
			self.state = STATE_CLOSE; self.original.close(callback); break;
		case STATE_OPENNING:
			closeWhenOpen(); break;
		case STATE_CLOSE:
			default:
				("function" === typeof callback) && callback( null );
	}
	return this;
	function closeWhenOpen (argument) {
		self.once("open", function(err, original) { 
			self.state = STATE_CLOSE; 
			if (err) {
				("function" === typeof callback) && callback( null );
			}
			else{
				original.close( callback );
			}
		});
	}
}

/**
* Find collection
*
* @param {String} name
* @param {Object} options
* @return {Collection}
* @api public
*
*/


db.prototype.collection = function( name, options ) {
	return this._collections[name] || ( this._collections[name] = new collection( name, this, options ) );
}


