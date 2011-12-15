/*!
* Mongoq 
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
, util = require('./util')
, db = require('./db')
, collection = require('./collection')
, cursor = require('./cursor');

/**
* Mongoq interface
* @see mongoq
* @api public
*/

module.exports = mongoq;

/** 
* Library version. 
*/

mongoq.version = JSON.parse(require("fs").readFileSync(require("path").join(__dirname, '..', 'package.json'), 'utf8'))['version'];

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
* Link to util. 
* @api public
*/

mongoq.util = util;

/**
* Link to db class. 
* @api public
*/

mongoq.db = db;

/**
* Link to collection class. 
* @api public
*/

mongoq.collection = collection;

/**
* Link to cursor class. 
* @api public
*/

mongoq.cursor = cursor;

/**
* Link to SessionStore
* @api public
*/

mongoq.SessionStore = require("./session");

/** 
* Connnect to mongodb
*
* Supports connection string.
*
* - mongodb://localhost/testdb
* - mongodb://fred:foobar@localhost:27017/testdb?auto_reconnect=true&poolSize=2
* - mongodb://fred:foobar@localhost:27017,localhost:27018/testdb?reconnectWait=2000;retries=20
*
* The options include server config options and db options
* - `host` the mongodb server host
* - `port` the mongodb server port
*
* @param {String} dbnameOrUrl
* @param {Object} options
* @return {Db}
* @api public
*
*/

function mongoq( dbnameOrUrl, options ) {
	options = options || {};
	var dbname
	, url = dbnameOrUrl || "mongodb:\/\/localhost:27017/default"
	, query
	, urlRE = new RegExp('^mongo(?:db)?://(?:|([^@/]*)@)([^@/]*)(?:|/([^?]*)(?:|\\?([^?]*)))$')
		, match = url.match(urlRE);
	if( !match ) {
		//Check if dbname
		var host = options.host || "localhost"
		, port = options.port || "27017";
		url = "mongodb:\/\/" + host + ":" + port + "/" + url;
		match = url.match(urlRE);
	}
	if ( !match )
		throw Error("URL must be in the format mongodb:\/\/user:pass@host:port/dbname or dbname");

	dbname = match[3] || 'default';

	/** parse query to options */
	if (match[4]) {
		query = (match[4] || '').split(/[&;]/);
		query.forEach(function(param){
			param = param.split("=");
			var key = param[0], val = param[1];
			if ( [undefined, '', 'true', 'false'].indexOf(val) != -1 ) {
				options[key] = val != 'false';
			} else if ( parseFloat(val).toString() === val ) {
				options[key] = parseFloat(val);
			} else {
				options[key] = val;
			}
		});
	}

	/** servers */
	var servers = match[2].split(',').map(function(h) {
		var hostPort = h.split(':', 2);
		return new mongodb.Server(hostPort[0] || 'localhost', +hostPort[1] || 27017, options);
	});

	var server;
	if (servers.length == 1) {
		server = servers[0];
	} else {
		var op = {};
		//Dup opitons
		for( var key in options ) {
			op[ key ] = options[ key ];
		}
		server = new mongodb.ReplSetServers(servers, op);
	}

	/** auth */
	var auth = (match[1] || '').split(':', 2);
	if ( auth.length && auth[0] ) {
		options.username = auth[0];
		options.password = auth[1];
	}

	return new db(dbname, server, options);
}


