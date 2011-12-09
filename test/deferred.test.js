var mongoq = require('../index.js')
	, should = require('should');

describe("deferred", function() {
	it("should return a promise object when find", function( done ){
		var users = mongoq("mongoqTest", {auto_reconnect: true}).collection("users23424")
			, hadOpen = false;

		users.drop(function() {
			users.insert([{name: "jack"}, {name: "lucy"}]).done(function(_users) {
				users.find().toArray().done(function(_users) {
					should.exist( _users );
					_users.should.have.length( 2 );
					hadOpen = true;
				}).done(function(_users) {
					_users.should.have.length( 2 );
					//Deferred not supports find().each()
					users.find().each().done(function(user) {

						hadOpen.should.be.true;
						users.db.close(done);

					});
				});
			});
		});

	});
});

