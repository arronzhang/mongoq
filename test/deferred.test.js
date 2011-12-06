var mongoq = require('../index.js')
	, should = require('should');

module.exports = {
	"test find": function( beforeExit ){
		var users = mongoq("mongoqTest", {auto_reconnect: true}).collection("users23424")
			, hadOpen = false;

		users.drop(function() {
			users.insert({name: "jack"}).done(function(_users) {
				users.find().toArray().done(function(_users) {
					should.exist( _users );
					_users.should.have.length( 1 );
					hadOpen = true;
				}).done(function(_users) {
					_users.should.have.length( 1 );
					users.db.close();
				});
			});
		});

		beforeExit(function() {
			hadOpen.should.be.true;
		});

	}
};

