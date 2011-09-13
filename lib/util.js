
var jQuery = require("jquery-deferred")
, slice = Array.prototype.slice;

exports.enableDeferred = enableDeferred;
exports.proxy = proxy;
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
			, args = slice.call(arguments, 0)
			, len = args.length - 1
			, callback = ( 'function' === typeof args[len] ) && args[len];

			self.open(function(err, original) {
				if( err ) {
					callback && callback.call(self, err);
				} else {
					original[key].apply(original, args);
				}
			});
			return self;
		}
	} );
}


