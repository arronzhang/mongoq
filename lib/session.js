/**
 * connect session store
 *
 * Use in express or connect project
 *
 * Examples:
 *
 * 	Use in normal collection
 *
 * 		app.use(express.session({
 * 		    store: new mongoq.SessionStore( mongoq("mongodb://localhost").collection("sessions") )
 * 		}));
 *
 * 	Use in capped collection with max length 4096
 *
 * 		app.use(express.session({
 * 		    store: new mongoq.SessionStore( mongoq("mongodb://localhost").collection("sessions", {
 * 		    	capped: true,
 * 		    	max: 4096, 
 * 		    	size: 4096 * 8192 
 * 		    }) )
 * 		}));
 *
 */

/**
 * Module dependencies
 */

var Store;
try{
	Store = require('connect').session.Store;
}catch(e){
	try{
		Store = require('express').session.Store;
	}catch(e){
		Store = loop;
	}
}

function loop () {
}

/**
 * Initialize SessionStore with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

var SessionStore = module.exports = function SessionStore( col, options ) {
	if( Store === loop ) {
		throw new Error("Before using SessionStore, You should install connect or express into your project.");
	}
	options = options || {};
	Store.call( this, options );

	this.collection = col;
	this.capped = col._options.capped;
};

/**
 * Inherit from `Store`.
 */

SessionStore.prototype.__proto__ = Store.prototype;

/**
 * Auto clear expired data if the collection is not capped
 *
 * @param {Number} interval second
 * @api public
 *
 */

SessionStore.prototype.autoClear = function( interval ) {
	var self = this;
	setInterval(function() {          
		!self.capped && self.collection.remove( { expires: {$lte: new Date()} } );
	}, clear_interval * 1000);
};

/**
 * Attempt to fetch session by the given `sid`.
 *
 * @param {String} sid
 * @param {Function} fn
 * @api public
 */

SessionStore.prototype.get = function(sid, fn) {
	var self = this;
	self.collection.findOne({_id: sid})
		.done( function(sess) {
			if (sess) {
				if ( !sess.expires || new Date < sess.expires ) {
					//Make the session is string... we can't update undefined attr in capped collection...
					fn && fn( null, JSON.parse( sess.session ) );
				} else {
					self.destroy( sid, fn );
				}
			} else {
				fn && fn();
			}
		} )
		.fail( fn );
};

/**
 * Commit the given `sess` object associated with the given `sid`.
 *
 * @param {String} sid
 * @param {Session} sess
 * @param {Function} fn
 * @api public
 */

SessionStore.prototype.set = function( sid, session, fn ) {
	this.collection.update( 
		{ _id: sid }
	  , { 
		  _id: sid
		, session: JSON.stringify( session )
		, expires: session && session.cookie && session.cookie.expires ? 
			  new Date( session.cookie.expires ) : new Date("3040-1-1")
		}
	  , { upsert: true, safe: true }
	  , function( err ) {
		  (fn || loop)( err );
		}
	);
};

/**
 * Destroy the session associated with the given `sid`.
 *
 * @param {String} sid
 * @api public
 */

SessionStore.prototype.destroy = function( sid, fn ) {
	this.capped ?
		this.collection.update( {_id: sid}, { $set: { expires: new Date("2000-1-1") } }, {}, function( err ) {
			(fn || loop)( err );
		} ) :
		this.collection.remove( {_id: sid}, function( err ) {
			(fn || loop)( err );
		} );
};

/**
 * Fetch number of sessions.
 *
 * @param {Function} fn
 * @api public
 */

SessionStore.prototype.length = function( fn ) {
	this.collection.count({ expires: { $gt: new Date() } }, fn || loop );
};

/**
 * Clear all sessions.
 *
 * @param {Function} fn
 * @api public
 */

SessionStore.prototype.clear = function(fn) {
	this.collection.drop( fn || loop );
};

