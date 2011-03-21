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

var mongodb = require("mongodb"),
BSON = mongodb.BSONPure;
//new BSON.ObjectID()

function mcollection (db, name) {
	this.db = db;
	this.name = name;
}

mcollection.prototype._open = function(callback){
	var self = this;
	if( self.collection ) {
		callback && callback( null, self.collection );
		return;
	}
	self.db._open(function(err, client) {
		if( err ) {
			callback && callback(err, client);
		} else {
			client.collection(self.name, function(err, collection) {
				self.collection = err ? null : collection;
				callback && callback(err, collection);
			});
		}
	});
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
		if( !callback ) {
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

function mdb(dbname, options) {
	this.dbname = dbname;
	this.collections = {};
	this.options = options || {};
}

mdb.prototype._open = function(callback) {
	var self = this;
	if( self.client ) {
		callback && callback( null, self.client );
		return;
	}
	var client = new mongodb.Db(self.dbname, new mongodb.Server(self.options.host, self.options.port, self.options));
	client.open(function(err, p_client) {
		self.client = err ? null : client;
		callback && callback( err, client );
	});
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
			return self.client ? self.client[key].apply(self.client, args) : null;
		}
		self._open(function(err, client) {
			if( err ) {
				callback(err, client);
			} else {
				client[key].apply(client, args);
			}
		});
	}
});

//disable default open
delete mdb.prototype.open;
delete mdb.prototype.close;

mdb.prototype.close = function() {
	var c = this.client;
	//Clear cache
	this.client = null;
	this.collections = {};
	c && c.close();
}

mdb.prototype.collection = function(name) {
	return this.collections[name] || (this.collections[name] = new mcollection(this, name));
}

var dbs = {};
function getDB(dbname, options) {
	options = options || {};
	options.host = options.host || "127.0.0.1";
	options.port = options.port || mongodb.Connection.DEFAULT_PORT;
	var key = options.host + ":" + options.port + "/" + dbname;
	return dbs[key] || (dbs[key] = new mdb(dbname, options));
}

getDB.close = function() {
	for( var key in dbs ) {
		dbs[key].close();
	}
}

getDB.mongodb = mongodb;
module.exports = getDB;


