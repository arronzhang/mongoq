
var jQuery = require("jquery-deferred")
	, slice = [].slice
	, isFunction = jQuery.isFunction;

exports.parseArgs = parseArgs;
exports.extend = extend;
exports.and = and;
exports.next = next;
exports.when = jQuery.when;
exports.Deferred = jQuery.Deferred;

function parseArgs (args) {
	var all = slice.call(args, 0)
		, clean = slice.call(args, 0)
		, len = all.length - 1
		, callback = ( 'function' === typeof all[len] ) ? all[len] : null;

	if( callback ) clean.pop();

	return {
		all: all,
		clean: clean,
		callback: callback
	};
}

function extend(object, fromObject, getters, ignores, originalName, setters) {

	originalName = originalName || "original";

	Object.keys(fromObject.prototype).forEach( function( key ) {

		if( ignores && ignores.indexOf( key ) != -1 ) return;

		if( getters && getters.indexOf( key ) != -1 ) {
			object.prototype[key] = function(){
				var original = this[originalName];
				return original && original[key].apply(original, arguments);
			}
			return;
		}

		if( setters && setters.indexOf( key ) != -1 ) {
			object.prototype[key] = function(){
				var args = slice.call(arguments, 0);
				this.open(function(err, original) {
					if( !err ) {
						original[key].apply(original, args);
					}
				});
				return this;
			}
			return;
		}

		object.prototype[key] = function(){
			var self = this
				, args = parseArgs( arguments )
				, callback = args.callback;

			// Deferred doesn't support find().each(), beacuse the callback will be called repeatedly
			var dfd = jQuery.Deferred();

			self.open( function(err, original) {
				if( err ) {
					fn(err);
				} else {
					args.clean.push( fn );
					original[key].apply(original, args.clean);
				}
			} );

			function fn () {
				var args = slice.call(arguments, 0);
				callback && callback.apply( self, args );
				if ( !args[0] ) {
					args.shift();
					dfd.resolveWith( self, args );
				} else {
					dfd.rejectWith( self, args );
				}
			}
			var promise = dfd.promise();
			promise.and = and;
			promise.next = next;
			return promise;
		}
	} );
}

/**
 * and
 *
 * run promise object series or parallel and then serialize the result
 *
 * and( aPromise )
 * 	.and( function( aValue ){
 * 		return bPromise;
 * 	} )
 * 	.and( cPromise )
 * 	.done( function( aValue, bValue, cValue ){
 * 	} )
 * 	.fail( errorCallback );
 *
 * @param {Function} firstParam first can be a Promise object
 * @return {Promise}  
 *
 */


function and ( firstParam ) {

	var isThis = isFunction( this && this.promise )
		, len  = arguments.length;

	if( len > 1 ) {
		var args = slice.call( arguments, 0 )
			, fn = args.shift()
			, promise = isThis ? this.and( fn )  : and( fn );

		return promise.and.apply( promise, args );
	}

	if( ! isThis ) {
		//The first deferred
		var promise = isFunction( firstParam ) ? firstParam() : firstParam;
		if( !isFunction( promise && promise.promise ) ) {
			promise = len ? jQuery.when( promise ) : jQuery.when();
		}
		promise.and = and;
		promise.next = next;
		return promise;
	} 

	var dfd = jQuery.Deferred();
	this.then( function() {
		var last = slice.call( arguments )
			, res;
		try {
			res = isFunction(firstParam) ? firstParam.apply( null, last ) : firstParam;
		} catch( e ) {
			res = e;
		}
		if( res instanceof Error ) {
			dfd.reject( res );
		} else {
			res = isFunction( res && res.promise ) ? res : jQuery.when( res );
			res.then( function( value ) {
				var args = [ arguments.length > 1 ? slice.call( arguments, 0 ) : value ]
					, i = last.length;
				while( i ) {
					args.unshift( last[ --i ] );
				}
				dfd.resolve.apply( dfd, args );
			}, dfd.reject );
		}

	}, dfd.reject );

	var promise = dfd.promise();
	promise.and = and;
	promise.next = next;
	return promise; 
}

/**
 * next
 *
 * run promise object series then give the result to the next
 *
 * next( aPromise )
 * 	.next( function( aValue ){
 * 		return bPromise;
 * 	} )
 * 	.next( function( bValue ){
 * 		return cPromise;
 * 	} )
 * 	.done( function( cValue ){
 * 	} )
 * 	.fail( errorCallback );
 *
 * @param {Function} firstParam first can be a Promise object
 * @return {Promise}  
 *
 */

 function next ( firstParam ) {

	var isThis = isFunction( this && this.promise )
		, len  = arguments.length;

	if( len > 1 ) {
		var args = slice.call( arguments, 0 )
			, fn = args.shift()
			, promise = isThis ? this.next( fn )  : next( fn );

		return promise.next.apply( promise, args );
	}

	if( ! isThis ) {
		//The first deferred
		var promise = isFunction( firstParam ) ? firstParam() : firstParam;
		if( !isFunction( promise && promise.promise ) ) {
			promise = len ? jQuery.when( promise ) : jQuery.when();
		}
		promise.next = next;
		promise.and = and;
		return promise;
	} 

	var dfd = jQuery.Deferred();
	this.then( function() {
		var last = slice.call( arguments )
			, res;
		try {
			res = isFunction(firstParam) ? firstParam.apply( null, last ) : firstParam;
		} catch( e ) {
			res = e;
		}
		if( res instanceof Error ) {
			dfd.reject( res );
		} else {
			res = isFunction( res && res.promise ) ? res : jQuery.when( res );
			res.then( function( value ) {
				var args = [ arguments.length > 1 ? slice.call( arguments, 0 ) : value ];
				dfd.resolve.apply( dfd, args );
			}, dfd.reject );
		}

	}, dfd.reject );

	var promise = dfd.promise();
	promise.next = next;
	promise.and = and;
	return promise; 
}


