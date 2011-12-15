var mongoq = require('../index.js')
  , should = require('should');

describe("session", function() {

	var db = mongoq("mongoqTest");

	it("should work with normal collection", function( done ) {
		var sessions = db.collection("sessions");

		var store = new mongoq.SessionStore( sessions );

		store.clear( function(err) {
			store.set( "1", {id: 1 }, function( err ) {
				should.not.exist( err );
				store.set( "1", {id: 2}, function( err ) {
					should.not.exist( err );
					store.get( "1", function(err, sess) {
						sess.should.eql( { id: 2 } );
						store.destroy("1", function(err, c) {
							should.not.exist( err );
							should.not.exist( c );
							store.get( "1", function(err, sess) {
								should.not.exist( sess );
								store.length( function(err, l) {
									l.should.equal( 0 );
									db.close();
									done();
								} );
							});
						});
					});
				} );
			} );
		} );
	});

	it("should work with capped collection", function( done ) {
		var sessions2 = db.collection("sessions2", {
			capped: true
		  , max: 4096 
		  , size: 4096 * 8192
		  , autoIndexId: true
		});

		var store = new mongoq.SessionStore( sessions2 );
		store.clear( function(err) {
			store.set( "1", {id: 1 }, function( err ) {
				should.not.exist( err );
				store.set( "1", {id: 2}, function( err ) {
					should.not.exist( err );
					store.get( "1", function(err, sess) {
						sess.should.eql( { id: 2 } );
						store.destroy("1", function(err, c) {
							should.not.exist( err );
							should.not.exist( c );
							store.get( "1", function(err, sess) {
								should.not.exist( sess );
								store.length( function(err, l) {
									l.should.equal( 0 );
									done();
								});
							});
						});
					});
				} );
			} );
		} );
	});
});

