/**
*
* MongoDB lib.
*
* When you are collect some data. it's very useful.
*
* Run like this.
*
* 	var db = require("db")
* 	db("testdb").collection("users").find
*
*/

var mongodb = require("mongodb")
, url = require("url")
, BSON = mongodb.BSONPure;
//new BSON.ObjectID()

/** dbs cache */
var dbs = {};

/** main mongoq */

function mongoq( dbnameOrCSting, options ) {
	options = options || {};
	var dbname, query;
	//Connection string.
	if ( 0 == dbnameOrCSting.indexOf("mongodb:\/\/") ) {
		var uri = url.parse(dbnameOrCSting, true);
		options.host = uri.hostname;
		options.port = uri.port;
		dbname = uri.pathname.replace(/^\//, '');
		if ( uri.auth ) {
			var auth = uri.auth.split(':');
			options.username = auth[0];
			options.password = auth[1];
		}
		/** parse query to options */
		query = uri.query;
		if ( query && 'object' === typeof query ) {
			for( var key in query ) {
				var val = query[key];
				if ( ['', 'true', 'false'].indexOf(val) != -1 ) {
					options[key] = val != 'false';
				} else if ( parseFloat(val).toString() === val ) {
					options[key] = parseFloat(val);
				} else {
					options[key] = val;
				}
			}
		}
	} else {
		dbname = dbnameOrCSting;
	}
	options.host = options.host || "127.0.0.1";
	options.port = options.port || mongodb.Connection.DEFAULT_PORT;
	var key = url.format({
		protocol: "mongodb:", 
		hostname: options.host, 
		port: options.port,
		pathname: "/" + dbname,
		auth: options.username ? (options.username + ":" + options.password) : null,
		query: query
	});
	return dbs[key] || (dbs[key] = new mdb(dbname, options));
}

mongoq.close = function() {
	for( var key in dbs ) {
		dbs[key].close();
	}
}

/** mongoq version */
mongoq.version = "0.1.0";

/** link to mongodb */
mongoq.mongodb = mongodb;

/** link to BSON */
mongoq.BSON = BSON;

module.exports = mongoq;


function mcollection (db, name) {
	this.db = db;
	this.name = name;
	this.queueOpen = [];
}

mcollection.prototype._open = function(callback){
	var self = this;
	if( self.collection ) {
		callback && callback( null, self.collection );
		return;
	}
	self.queueOpen.push(callback);
	if( !self.isopen ) {
		self.isopen = true;
		self.db._open(function(err, db) {
			if( err ) {
				callback && callback(err, db);
			} else {
				db.collection(self.name, function(err, collection) {
					self.collection = err ? null : collection;
					self.queueOpen.forEach(function(cb) {
						cb && cb(err, collection);
					});
					self.queueOpen = [];
				});
			}
		});
	}
}

var __slice = Array.prototype.slice;

function proxy(ob, fn, args, handler){
	args = __slice.call(args, 0); 
	var id, callback;
	for (var i = args.length - 1; i >= 0; i--) {
		if( 'function' === typeof args[i] ){
			id = i;
			callback = args[i];
			break;
		}
	}
	if( callback ) {
		args[id] = function(err, doc) {
			handler && handler(err, doc, callback);
		};
	}
	return fn ? fn.apply(ob, args) : null;
}

//'checkCollectionName', 'normalizeHintField', 
//['insert', 'remove', 'rename', 'insertAll', 'save', 'update', 'distinct', 'count', 'drop', 'findAndModify', 'find', 'findOne', 'createIndex', 'ensureIndex', 'indexInformation', 'dropIndex', 'dropIndexes', 'mapReduce', 'group']
var mignoreMethods = ['checkCollectionName', 'normalizeHintField'];
Object.keys(mongodb.Collection.prototype).forEach(function(key) {
	mcollection.prototype[key] = function(){
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
		if( -1 != mignoreMethods.indexOf(key) ) {
			return self.collection ? self.collection[key].apply(self.collection, args) : null;
		}
		self._open(function(err, collection) {
			if( err ) {
				callback(err, collection);
			} else {
				collection[key].apply(collection, args);
			}
		});
	}
});

mcollection.prototype.findItems = function() {
	return proxy( this, this.find, arguments, function(err, cursor, callback) {
		if (err) {
			callback(err);
		} else {
			cursor.toArray(callback);
		}	
	});
};

function mdb(name, options) {
	this.name = name;
	this.collections = {};
	this.options = options || {};
	this.queueOpen = [];
}

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
	return this.collections[name] || (this.collections[name] = new mcollection(this, name));
}

