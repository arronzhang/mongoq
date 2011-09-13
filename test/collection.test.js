
var mongoq = require('mongoq')
, should = require('should');

module.exports = {
	"test collection options": function(beforeExit) {
		var users = mongoq("mongoqTest", {auto_reconnect: true}).collection("users", {slaveOk: false})
		, hadOpen = false;
		users.drop(function() {
			users.findOne(function() {
				var originalCol = users.original;
				originalCol.slaveOk.should.be.false;
				users.hint = {name: true};
				should.exist( originalCol.hint );
				originalCol.hint.name.should.be.true;
				hadOpen = true;
				users.db.close();
			});
		});
		beforeExit(function() {
			hadOpen.should.be.true;
		});
	}
	, "test inherit methods": function(beforeExit) {
		var users = mongoq("mongoqTest").collection("users")
		, hadOpen = false;
		users.drop()
		.insert({name: "Jack", phone: 1234567, email: "jake@mail.com"})
		.findOne(function(err, user) {
			should.not.exist( err );
			should.exist( user );
			user.name.should.be.eql("Jack");
			user.phone.should.be.equal(1234567);
			user._id.should.be.ok;
			hadOpen = true;
			users.db.close();
		});
		beforeExit(function() {
			hadOpen.should.be.true;
		});
	}
	, "test find": function(beforeExit) {
		var users = mongoq("mongoqTest").collection("users")
		, hadOpen = false;
		users.drop()
		.insert({name: "Jack", phone: 1234567, email: "jake@mail.com"})
		.find(function(err, cursor) { //Callback
			should.not.exist( err );
			should.exist( cursor );
		}).toArray(function(err, docs) {
			hadOpen = true;
			should.exist( docs );
			docs.should.be.an.instanceof( Array );
			docs.should.have.length(1);
			var user = docs[0];
			user.name.should.be.eql("Jack");
			user.phone.should.be.equal(1234567);
			user._id.should.be.ok;
			users.db.close();
		});
		beforeExit(function() {
			hadOpen.should.be.true;
		});
	}
};

