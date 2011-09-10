/*!
* Mongoq 0.1
* https://github.com/zzdhidden/mongoq
*
* Copyright (c) 2011 Hidden
* Released under the MIT, BSD, and GPL Licenses.
*
* Date: 2011-09-11
*/

/*!
* Module dependencies.
*/

var mongodb = require("mongodb")
, url = require("url")
, db = require('./db');

/**
* Mongoq interface
* @see mongoq
* @api public
*/

module.exports = mongoq;

/** 
* Library version. 
*/

mongoq.version = "0.1.0";

/** 
* Link to mongodb. 
* @api public
*/

mongoq.mongodb = mongodb;

/**
* Link to BSON. 
* @api public
*/

mongoq.BSON = mongodb.BSONPure;

/**
* This method will close all db's connections.
* @api public
*/
mongoq.close = function() {
	for( var key in dbs ) {
		dbs[key].close();
	}
}

/** 
* Mongoq root function
*
* Supports connection string.
*
* - mongodb://localhost/testdb
* - mongodb:\/\/fred:foobar@localhost:27017/testdb?auto_reconnect=true&poolSize=2
*
* The options include server config options and db options
* - `host` the mongodb server host
* - `port` the mongodb server port
*
* @param {String} dbnameOrCSting
* @param {Object} options
* @return {Db}
* @api public
*
*/

function mongoq( dbnameOrCSting, options ) {
	options = options || {};
	var dbname, query;
	// Parse connection string.
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
	// Default host and port
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
	return dbs[key] || (dbs[key] = new db(dbname, options));
}

/** 
* Loaded datebases cache.
* @api private
*/

var dbs = {};


