
var mongoq = require('../index.js')
, should = require('should');

var colnum = 1;
describe("collection", function() {
	it("test collection options", function(done) {
		var users = mongoq("mongoqTest", {auto_reconnect: true}).collection("users", {slaveOk: false})
		, hadOpen = false;
		users.drop(function() {
			users.findOne(function() {
				var originalCol = users.original;
				originalCol.slaveOk.should.be.false;
				users.hint = {name: true};
				should.exist( originalCol.hint );
				originalCol.hint.name.should.be.true;
				users.db.close(done);
			});
		});
	});
	it( "test inherit methods", function(done) {
		var users = mongoq("mongoqTest").collection("users" + (colnum++))
		, hadOpen = false;
		users.drop(function() {
			users.insert({name: "Jack", phone: 1234567, email: "jack@mail.com"}, function() {
				users.findOne(function(err, user) {
					should.not.exist( err );
					should.exist( user );
					user.name.should.be.eql("Jack");
					user.phone.should.be.equal(1234567);
					user._id.should.be.ok;
					hadOpen = true;
					users.db.close(done);
				});
			});		
		});
	});
	it( "test find", function(done) {
		var db = mongoq("mongoqTest")
		, colname = "users" + (colnum++)
		, users = db.collection(colname)
		, hadOpen = false
		, hadOpen2 = false;
		users.drop(function() {
			users.insert({name: "Jack", phone: 1234567, email: "jack@mail.com"}, function() {
				db.close(function() {
					//Reconnect
					users.find(function(err, cursor) { //Callback
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
						users.find(function(err, cursor){
							hadOpen2 = true;
							db.close(done);
						});
					});
				});

			});
		});
		var num = 0;
		db.on("open", function() {
			num ++;
		});
	});
	it( "test findItems", function(done) {
		var users = mongoq("mongoqTest").collection("users" + (colnum++))
		, hadOpen = false;
		users.drop(function() {
			users.insert({name: "Jack", phone: 1234567, email: "jack@mail.com"}, function() {
				users.findItems(function(err, docs) { //Callback
					hadOpen = true;
					should.exist( docs );
					docs.should.be.an.instanceof( Array );
					docs.should.have.length(1);
					var user = docs[0];
					user.name.should.be.eql("Jack");
					user.phone.should.be.equal(1234567);
					user._id.should.be.ok;
					users.db.close(done);
				});
			});
		});
	});
	it( "test cursor", function(done) {
		var users = mongoq("mongoqTest").collection("users" + (colnum++))
		, hadOpen = false;
		users.drop(function() {
			users.insert([{name: "Jack", phone: 1234567, email: "jack@mail.com"}, {name: "Lucy", phone: 123, email: "lucy@mail.com"}], function() {
				users.find().skip(1).limit(1).toArray(function(err, docs) { //Callback
					hadOpen = true;
					should.exist( docs );
					docs.should.be.an.instanceof( Array );
					docs.should.have.length(1);
					var user = docs[0];
					user.name.should.be.eql("Lucy");
					user.phone.should.be.equal(123);
					user._id.should.be.ok;
					users.db.close(done);
				});
			});
		});
	});
	it( "test group", function(done) {
		var users = mongoq("mongoqTest").collection("users" + (colnum++))
		, hadOpen = false;
		users.drop(function() {
			//Test count by group.
			users.insert([{name: "Jack", sex: "male", email: "jack@mail.com"}, {name: "Lucy", sex: "female", email: "lucy@mail.com"}, {name: "Lili", sex: "female", email: "lili@mail.com"}], function() {
				users.group({ "sex":true }, {}, {count:0}, function(obj, prev){ prev.count++ }, function(err, docs){
					//dcos=> [ { sex: 'male', count: 1 }, { sex: 'female', count: 2 } ]
					should.exist( docs );
					docs.should.be.an.instanceof( Array );
					docs.should.have.length(2);
					users.group({ "sex":true }, {name: "Jack", email: "jack@mail.com"}, {count:0}, function(obj, prev){ prev.count++ }, function(err, docs){
						should.exist( docs );
						docs.should.be.an.instanceof( Array );
						docs.should.have.length(1);
						docs[0].count.should.be.equal(1);
						docs[0].sex.should.be.equal("male");
						hadOpen = true;
						users.db.close(done);
					});
				});
			});
		});
	});

	it( "test insert push", function(done) {
		var users = mongoq("mongoqTest").collection("users" + (colnum++))
		, hadOpen = false;
		users.drop(function() {
			users.insert({name: "jack", childrens: ["Lucy"]}, function() {
				users.update({name: "jack"}, {$push: {childrens: "Lili" }}, function() {
					users.findOne({name: "jack"}, function(err, user) {
						should.exist( user );
						user.childrens.should.have.length( 2 );
						user.childrens[1].should.equal("Lili");
						users.db.close( done );
					});
				});
			});
		});
	});
});

