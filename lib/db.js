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
, EventEmitter = require("events").EventEmitter
, inherits = require('util').inherits
, collection = require('./collection');

/**
* Mongoq db class
*
* @param {String} name
* @param {Object} options
*
* @api public
*
*/

module.exports = mdb;
function mdb(name, options) {
	EventEmitter.call(this);
	this.name = name;
	this.collections = {};
	this.options = options || {};
	this.queueOpen = [];
}

/**
* Enable events
*/

inherits( mdb, EventEmitter );

mdb.prototype._open = function(callback) {
	var self = this;
	if( self.db ) {
		callback && callback( null, self.db );
		return;
	}
	self.queueOpen.push(callback);
	if( !self.isopen ) {
		self.isopen = true;

		var server = new mongodb.Server(self.options.host, self.options.port, self.options);

		var db = new mongodb.Db(self.name, server, self.options);
		db.open(function(err, p_client) {
			if(!err && self.options.username){
				db.authenticate(self.options.username, self.options.password, function(err, success){
					if(success){
						handle(null, db, server);
					}
					else {
						handle(err ? err : new Error('Could not authenticate user ' + self.options.username), db, server);
					}
				});
			}
			else {
				handle(err, db, server);
			}
		});
	}

	function handle(err, db, server) {
		self.db = err ? null : db;
		self.server = err ? null : server;
		self.queueOpen.forEach(function(cb) {
			cb && cb(err, db);
		});
		self.queueOpen = [];
	}
}

var __slice = Array.prototype.slice;

Object.keys(mongodb.Db.prototype).forEach(function(key) {
	mdb.prototype[key] = function(){
		var self = this,
		args = __slice.call(arguments, 0), 
		id, callback;
		for (var i = args.length - 1; i >= 0; i--) {
			if( 'function' === typeof args[i] ){
				id = i;
				callback = args[i];
				break;
			}
		};
		if( !callback ) {
			return self.db ? self.db[key].apply(self.db, args) : null;
		}
		self._open(function(err, db) {
			if( err ) {
				callback(err, db);
			} else {
				db[key].apply(db, args);
			}
		});
	}
});

//disable default open
delete mdb.prototype.open;
delete mdb.prototype.close;

mdb.prototype.close = function() {
	var c = this.db;
	//Clear cache
	this.db = null;
	this.collections = {};
	c && c.close();
}

mdb.prototype.collection = function(name) {
	return this.collections[name] || (this.collections[name] = new collection(this, name));
}

/**
* Inherits db events [error,close,timeout]
*
* @api private
*
*/

mdb.prototype._inheritEvents = function() {
	var self = this;
	["error", "close", "timeout"].forEach(function(event) {
		self.db.on(event, function() {
			var args = __slice.call(arguments, 0); 
			args.unshift(event);
			self.emit.apply(self, args);
		});
	});
};
