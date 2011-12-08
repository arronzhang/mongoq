
var jQuery = require("jquery-deferred")
	, slice = Array.prototype.slice;

exports.parseArgs = parseArgs;
exports.extend = extend;

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
			deferred.promise( self );

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
			return deferred;
		}
	} );
}

