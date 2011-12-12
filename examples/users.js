/**
 * Example for insert/update/find/remove users
 *
 */

var assert = require("assert")
	, mongoq = require("../index.js")
	, db = mongoq("mongodb://127.0.0.1:27017/mongoqTest")
	, User = db.collection("users");

User.remove() //clear test date
	.done( function() {
		User.insert( [{ _id: 1, name: "Jack", age: 22 }, { _id: 2, name: "Lucy", age: 20 }] ) //Add Jack and Lucy
			.and( User.insert( { _id: 3, name: "Mike", age: 21 } ) ) //Add Mike synchronous
			.and( function(u1, u2) {
				return User.update({_id: 3}, {$set: {age: 25}}, {safe: 1});
			} )
			.and( function(u1, u2, u3) {
				// Will find after add Jack, Lucy and Mike
				return User.findOne( { name: u2[0]["name"] } )
			} )
			.done( function(u1, u2, u3, u4) { //All be done
				assert.deepEqual( u1, [{ _id: 1, name: "Jack", age: 22 }, { _id: 2, name: "Lucy", age: 20 }], "Insert first" );
				assert.deepEqual( u2, [{ _id: 3, name: "Mike", age: 21 }], "insert second" );
				assert.deepEqual( u4, { _id: 3, name: "Mike", age: 25 }, "Find after insert" );
				db.close();
			} )
			.fail( function( err ) { // Any error occur
				console.log( err );
			} );
	} )
	.fail( function( err ) { // Faild to remove
		console.log( err );
	} );

