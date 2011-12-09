
var jQuery = require("jquery-deferred")
	, slice = Array.prototype.slice;

exports.parseArgs = parseArgs;
exports.extend = extend;
exports.next = next;

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
			var deferred = jQuery.Deferred();

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
					deferred.resolveWith( self, args );
				} else {
					deferred.rejectWith( self, args );
				}
			}
			return deferred.promise();
		}
	} );
}

/**
 * next
 *
 * run promise object step by step.
 *
 * next( aPromise )
 * 	.next( function( aValue ){
 * 		return bPromise;
 * 	} )
 * 	.next( function( aValue, bValue ){
 * 		return cPromise;
 * 	} )
 * 	.done( function( aValue, bValue, cValue ){
 * 	} )
 * 	.fail( errorCallback );
 *
 * @param {Function} firstParam first can be a Promise object
 * @return {Promise}  
 *
 */

function next ( firstParam ) {
	if( ! jQuery.isFunction( this.promise ) ) {
		//The first deferred
		var promise = jQuery.isFunction( firstParam ) ? firstParam() : firstParam;
		promise.next = next;
		return promise;
	} 
	var dfd = jQuery.Deferred();
	this.done( function() {
		var last = slice.call( arguments )
			, res;
		try{
			res = firstParam.apply( null, last );
		} catch( e ) {
			res = e;
		}
		jQuery.isFunction( res && res.promise ) ?
			res.done( function() {
				var args = slice.call( arguments );
				for (var i = last.length - 1; i >= 0; i--) {
					args.unshift( last[i] );
				}
				dfd.resolve.apply( dfd, args );
			} ).fail( dfd.reject )
			: dfd.reject( res );

	} ).fail( dfd.reject );

	var promise = dfd.promise();
	promise.next = next;
	return promise; 
}
