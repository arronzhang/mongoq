/*!
 * Mongoq
 *
 * Copyright (c) 2011 Hidden
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: 2011-09-11
 */

var mongodb = require("mongodb");


module.exports = mcollection;


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


