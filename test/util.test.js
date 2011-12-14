
var mongoq = require('../index.js')
	, util = mongoq.util
	, should = require('should');

describe( "util", function() {
	it( 'test util parseArgs', function(){
		(function() {
			var args = util.parseArgs(arguments);
			args.all.should.have.length(3);
			args.clean.should.have.length(3);
			args.clean[0].should.be.equal(1);
			should.not.exist(args.callback);

		})(1,2,3);

		(function() {
			var args = util.parseArgs(arguments);
			args.all.should.have.length(4);
			args.clean.should.have.length(3);
			args.clean[0].should.be.equal(1);
			should.exist(args.callback);
			args.callback.should.have.an.instanceof(Function);
		})(1,2,3, function() {
		});
	});

	describe( "and next", function() {
		var successPromise = function(val) {
			var dfd = util.Deferred();
			var args = [].slice.call( arguments, 0 );
			setTimeout( function() {
				dfd.resolve.apply( dfd, args );
			} ,40 );
			var p = dfd.promise();
			p.and = util.and;
			p.next = util.next;
			return p;
		}
		, failPromise = function(val) {
			var dfd = util.Deferred();
			setTimeout( function() {
				dfd.reject( val );
			} ,40 );
			var p = dfd.promise();
			p.and = util.and;
			p.next = util.next;
			return p;
		};

		it( "should success and", function( done ) {
			util.and( successPromise("v1") )
				.and( function(v1) {
					return successPromise( "v2", "v21" );
				})
				.and( function(v1, v2) {
					return successPromise( );
				})
				.and( function(v1, v2, v3) {
					return successPromise( "v4", "v41" );
				})
				.done( function(v1, v2, v3, v4) {
					v1.should.be.eql("v1");
					v2.should.be.eql(["v2", "v21"]);
					should.not.exist( v3 );
					v4.should.be.eql(["v4", "v41"]);
					arguments.should.have.length( 4 );
					done();
				})
				.fail(function() {
					false.should.be.true;
				});
		} );

		it( "should support anything value", function( done ) {
			util.and()
				.and( successPromise("v1") )
				.and( function(v1) {
					return successPromise( "v2", "v21" );
				})
				.and( "v3" )
				.done( function(v1, v2, v3) {
					v1.should.be.equal("v1");
					v2.should.be.eql(["v2", "v21"]);
					v3.should.be.equal("v3");
					arguments.should.have.length( 3 );
					done();
				})
				.fail(function() {
					false.should.be.true;
				} );
		} );

		it( "should have and method", function( done ) {
			successPromise("v1")
				.and( function(v1) {
					return successPromise( "v2" );
				})
				.and( function(v1, v2) {
					return successPromise( "v3" );
				})
				.and( function(v1, v2, v3) {
					return successPromise( "v4" );
				})
				.done( function(v1, v2, v3, v4) {
					v1.should.be.equal("v1");
					v2.should.be.equal("v2");
					v3.should.be.equal("v3");
					v4.should.be.equal("v4");
					arguments.should.have.length( 4 );
					done();
				})
				.fail(function() {
					false.should.be.true;
				} );
		} );

		it( "should support failed message", function( done ) {
			successPromise("v1")
				.and( function(v1) {
					return successPromise( "v2" );
				})
				.and( function(v1, v2) {
					return failPromise( "e3" );
				})
				.done( function(v1, v2, v3) {
					false.should.be.true;
				})
				.fail( function( err ) {
					err.should.be.equal("e3");
					done();
				});
		} );

		it( "should support failed message return", function( done ) {
			successPromise("v1")
				.and( function(v1) {
					return successPromise( "v2" );
				})
				.and( function(v1, v2) {
					return new Error( "e3" );
				})
				.done( function(v1, v2, v3) {
					false.should.be.true;
				})
				.fail( function( err ) {
					err.message.should.be.equal("e3");
					done();
				});
		} );

		it( "should support throw error", function( done ) {
			successPromise("v1")
				.and( function(v1) {
					return successPromise( "v2" );
				})
				.and( function(v1, v2) {
					throw new Error("e3");
				})
				.done( function(v1, v2, v3) {
					false.should.be.true;
				})
				.fail( function( err ) {
					err.message.should.be.equal("e3");
					done();
				});
		} );

		it( "should multi arguments", function( done ) {
			util.and( 
				successPromise("v1")
				, function(v1) {
					return successPromise( "v2", "v21" );
				}
				, function(v1, v2) {
					return successPromise( );
				}
				, function(v1, v2, v3) {
					return successPromise( "v4", "v41" );
				}
			)
				.done( function(v1, v2, v3, v4) {
					v1.should.be.eql("v1");
					v2.should.be.eql(["v2", "v21"]);
					should.not.exist( v3 );
					v4.should.be.eql(["v4", "v41"]);
					arguments.should.have.length( 4 );
					done();
				})
				.fail(function() {
					false.should.be.true;
				});
		} );

		it( "should success next", function( done ) {
			util.next( successPromise("v1") )
				.next( function(v1) {
					v1.should.be.eql("v1");
					return successPromise( "v2", "v21" );
				})
				.next( function(v2) {
					v2.should.be.eql(["v2", "v21"]);
					return successPromise( );
				})
				.next( function(v3) {
					should.not.exist( v3 );
					return successPromise( "v4", "v41" );
				})
				.done( function(v4) {
					v4.should.be.eql(["v4", "v41"]);
					arguments.should.have.length( 1 );
					done();
				})
				.fail(function() {
					false.should.be.true;
				});
		} );

		it( "should support throw error with next", function( done ) {
			successPromise("v1")
				.next( function(v1) {
					v1.should.be.eql("v1");
					return successPromise( "v2" );
				})
				.next( function(v2) {
					v2.should.be.eql("v2");
					throw new Error("e3");
				})
				.done( function(v3) {
					false.should.be.true;
				})
				.fail( function( err ) {
					err.message.should.be.equal("e3");
					done();
				});
		} );

		it( "should work together", function( done ) {
			successPromise("v1")
				.next( function(v1) {
					v1.should.be.eql("v1");
					return v1 + "v1";
				} )
				.and( successPromise("v2") )
				.next( function(v1, v2) {
					v1.should.be.eql("v1v1");
					v2.should.be.eql("v2");
					return successPromise(v1 + v2)
						.and( successPromise( "v3" ) );
				} )
				.and( "v4" )
				.done( function(v3, v4) {
					v3.should.be.eql([ "v1v1v2", "v3" ]);
					v4.should.be.eql( "v4" );
					done();
				})
				.fail( function() {
					false.should.be.true;
				});
		} );


	} );

});
