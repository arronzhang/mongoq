
var jQuery = require("jquery-deferred")
, slice = Array.prototype.slice;

exports.enableDeferred = enableDeferred;
exports.parseArgs = parseArgs;
exports.extend = extend;

/*
* Callback with deferred enable
*
* @param {Object} object
* @param {String} methodName
*
*/

function enableDeferred (object, methodName) {
	var proto = object.prototype
	, proxyMethodName = "__" + methodName;
	if( "function" === typeof proto[ methodName ] ){
		proto[proxyMethodName] =  proto[methodName];
		proto[methodName] = function() {
			var self = this
			, args = slice.call(arguments, 0)
			, len = args.length - 1
			, callback = ( 'function' === typeof args[len] ) && args[len]
			, deferred = jQuery.deferred();
			deferred.promise( self );

			//Proxy callback
			if( callback ) args.pop();
			args.push( fn );
			self[proxyMethodName]( fn );
			return self;

			function fn() {
				var args = slice.call(arguments, 0);
				callback && callback.apply( self, args );
				if (!args[0]) {
					args.shift();
					deferred.resolveWith( self, args );
				} else {
					deferred.rejectWith( self.args );
				}
			}
		};

	}
}

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


function extend(object, fromObject, getters, ignores, originalName) {

	originalName = originalName || "original";

	Object.keys(fromObject.prototype).forEach( function( key ) {

		if( ignores.indexOf( key ) != -1 ) return;

		if( getters.indexOf( key ) != -1 ) {
			object.prototype[key] = function(){
				var original = this[originalName];
				return original && original[key].apply(original, arguments);
			}
			return;
		}

		object.prototype[key] = function(){
			var self = this
			, args = parseArgs( arguments )
			, callback = args.callback;

			self.open(function(err, original) {
				if( err ) {
					callback && callback.call(self, err);
				} else {
					original[key].apply(original, args.all);
				}
			});
			return self;
		}
	} );
}


