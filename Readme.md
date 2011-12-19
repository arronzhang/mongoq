
MongoQ
============================

Use mongoDB like this: 

`mongoq("testdb").collection("users").find().toArray().done( function(docs){} ).fail( function(err){} )`;

Base on [node-mongodb-native][mongodb-native]


Features
-----------------------------

*	Standard [connection string format][connection string]
*	Full [node-mongodb-native][mongodb-native] methods supports
*	Chainable api
*	Introduce into [jQuery Deferred][jquery-deferred] which is based on the [CommonJS Promises/A][promises-a] design. => v0.2
*	Control-flow => v0.2


Installation
-----------------------------

>     npm install mongoq

Example
-----------------------------

>     var assert = require("assert")
>     	, mongoq = require("../index.js")
>     	, db = mongoq("mongodb://127.0.0.1:27017/mongoqTest")
>     	, User = db.collection("users");
> 
>     User.remove() //clear test date
>     	.done( function() {
>     		User.insert( [{ _id: 1, name: "Jack", age: 22 }, { _id: 2, name: "Lucy", age: 20 }] ) //Add Jack and Lucy
>     			.and( User.insert( { _id: 3, name: "Mike", age: 21 } ) ) //Add Mike synchronous
>     			.and( function(u1, u2) {
>     				// Will find after add Jack, Lucy and Mike
>     				return User.findOne( { name: u2[0]["name"] } )
>     			} )
>     			.done( function(u1, u2, u3) { //All be done
>     				assert.deepEqual( u1, [{ _id: 1, name: "Jack", age: 22 }, { _id: 2, name: "Lucy", age: 20 }], "Insert first" );
>     				assert.deepEqual( u2, [{ _id: 3, name: "Mike", age: 21 }], "insert second" );
>     				assert.deepEqual( u3, { _id: 3, name: "Mike", age: 21 }, "Find after insert" );
>     				db.close();
>     			} )
>     			.fail( function( err ) { // Any error occur
>     				console.log( err );
>     			} );
>     	} )
>     	.fail( function( err ) { // Faild to remove
>     		console.log( err );
>     	} );
> 

Work like node-mongodb-native
-----------------------------------------

Mongoq bridge all the methods and events from [mongodb native database][mongodb-native-database] and [mongodb native collections][mongodb-native-collections], and make it chainable.

###Access BSON

>     var mongoq = require("mongoq");
>
>     var BSON = mongoq.BSON;
>     var ObjectID = BSON.ObjectID;
>

###Database

Provide a simple [connection string][connection string]

>     var mongoq = require("mongoq");
>
>     //use default server localhost:27017, poolSize 1
>     var db = mongoq("testdb"); 
>
>     //use options
>     db = mongoq("testdb", {host: "127.0.0.1", port: "27017"}); 
>
>     //connection string
>     db = mongoq("mongodb://localhost/testdb"); 
>
>     // Connect and login to the "testdb" database as user "admin" with passowrd "foobar"
>     db = mongoq("mongodb://admin:foobar@localhost:27017/testdb?poolSize=2");
>
>     //Repl set servers
>     db = mongoq("mongodb://admin:foobar@localhost:27017,localhost:27018/testdb?reconnectWait=2000;retries=20");
>
>     //Add user
>     db.addUser("admin", "foobar", function(err) {});

methods

*	close(callback)
*	admin(callback)
*	collectionNames(collectionName?, callback) 
*	collection(collectionName, options?, callback)
*	collections(callback)
*	dereference(dbRef, callback)
*	logout(options, callback) Logout user from server, Fire off on all connections and remove all auth info
*	authenticate(username, password, callback)
*	addUser(username, password, callback)
*	removeUser(username, callback)
*	createCollection(collectionName, options?, callback)
*	dropCollection(collectionName, callback)
*	renameCollection(fromCollection, toCollection, callback)
*	lastError(options, connectionOptions, callback) 
*	error(options, callback)
*	lastStatus(callback) 
*	previousErrors(callback)
*	executeDbCommand(commandHash, options?, callback)
*	executeDbAdminCommand(commandHash, callback)
*	resetErrorHistory(callback)
*	createIndex(collectionName, fieldOrSpec, options?, callback) Create an index on a collection
*	ensureIndex(collectionName, fieldOrSpec, options?, callback) Ensure index, create an index if it does not exist
*	dropIndex(collectionName, indexName, callback) Drop Index on a collection
*	indexInformation(collectionName, options..., callback) 
*	dropDatabase(callback)
*	cursorInfo(callback) Fetch the cursor information
*	executeCommand(dbCommand, options, callback)


###Collection

>     var mongoq = require("mongoq");
>     var db = mongoq("mongodb://localhost/testdb"); 
>     var users = db.collection("users");
>     users.insert({name: "Jack", phone: 1234567, email: "jake@mail.com"});

methods

*	insert (docs, options?, callback?) 
*	remove (selector?, options?, callback?) 
*	rename (newName, callback) 
*	insertAll (docs, options?, callback?) 
*	save (doc, options?, callback?)
*	update (selector, document, options?, callback?) //  options:upsert,multi,safe
*	distinct (key, query?, callback?) 
*	count (query?, callback)
*	drop (callback) 
*	findAndModify (query, sort, doc, options?, callback?) // options: remove,unshift,new
*	find () //return Cursor
*	findOne (queryObject, options?, callback) 
*	createIndex (fieldOrSpec, options, callback?)
*	ensureIndex (fieldOrSpec, options, callback?)
*	indexInformation (options, callback)
*	dropIndex (name, callback)
*	dropIndexes (callback)
*	mapReduce (map, reduce, options, callback)
*	group (keys, condition, initial, reduce, command, callback)
*	options (callback)


###Cursor

>     var mongoq = require("mongoq");
>     var db = mongoq("mongodb://localhost/testdb"); 
>     var users = db.collection("users");
>     var cursor = users.find();
>     cursor.toArray(function(err, users){
>     	db.close();
>     });


methods

*	toArray(callback)
*	each(callback)
*	count(callback)
*	sort(keyOrList, direction) //=> this
*	limit(limit) //=> this
*	skip(limit) //=> this
*	batchSize(limit) //=> this
*	nextObject(callback)
*	getMore(callback)
*	explain(callback)

<a name="mongoq"></a>

MongoQ style
-----------------------------

###Deferred Object

MongoQ introduce into jQuery Deferred since v0.2, you can find more documents about jQuery Deferred Object at [here][jquery-deferred].

MongoQ make all mongodb asynchronous processes to return with a Promise Object.

>     var mongoq = require("mongoq");
>     var db = mongoq("mongodb://localhost/testdb"); 
>     var users = db.collection("users");
>     users.find().toArray()
>         .done( function( docs ) { 
>             //=> users
>         } )
>         .done( function( docs ) { 
>             //=> users
>         } )
>         .fail( function( error ) { 
>             //=> error
>         } )
>         .then( function( docs ) { 
>             //=> users
>         }, function( error ) { 
>             //=> error
>         } );

methods

*	done( doneCallbacks [, doneCallbacks] ) //=> Add handlers to be called when the Deferred object is resolved.
*	fail( failCallbacks [, failCallbacks] ) //=> Add handlers to be called when the Deferred object is rejected.
*	then( doneCallbacks, failCallbacks ) //=> Add handlers to be called when the Deferred object is resolved or rejected.
*	always( alwaysCallbacks ) //=> Add handlers to be called when the Deferred object is either resolved or rejected.


**Notice**: Please don't use `find().each().done(...`, the callbacks will be called only once.


###Control-flow

MongoQ add two methods called `and` and `next` to the Promise Object for the mongodb's parallel execution, serial execution and error handling painless.

**and**: run promise object series or parallel and then serialize the result

>     var mongoq = require("mongoq");
>     var db = mongoq("mongodb://localhost/testdb"); 
>     var users = db.collection("users");
>     var messages = db.collection("messages");
>     users.count()
>         .and( users.findOne() ) // parallel
>         .and( function( user ) { // serial when in function
>             return user ? messages.find({ user: user._id }).toArray() : [];
>         } )
>         .done( function( num, user, msgs ) {
>             //num from users.count
>             //user from users.findOne
>             //msgs from messages.find
>         } )
>         .fail( function( err ) {} );

**next**: run promise object series then give the result to the next

>     var mongoq = require("mongoq");
>     var db = mongoq("mongodb://localhost/testdb"); 
>     var users = db.collection("users");
>     var messages = db.collection("messages");
>     users.findOne()
>         .next( function( user ) { // serial when in function
>             return user ? messages.find({ user: user._id }).toArray() : [];
>         } )
>         .done( function( msgs ) {
>             //msgs from messages.find
>         } )
>         .fail( function( err ) {} );


Contributor
-----------------------------

* Caio Ribeiro Pereira (caio.ribeiro.pereira@gmail.com)


License 
-----------------------------

(The MIT License)

Copyright (c) 2011 hidden &lt;zzdhidden@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[mongodb-native]: https://github.com/christkv/node-mongodb-native
[mongodb-native-database]: https://github.com/christkv/node-mongodb-native/blob/master/docs/database.md
[mongodb-native-collections]: https://github.com/christkv/node-mongodb-native/blob/master/docs/collections.md
[promises-a]: http://wiki.commonjs.org/wiki/Promises/A
[jquery-deferred]: http://api.jquery.com/category/deferred-object/
[connection-string]: http://www.mongodb.org/display/DOCS/Connections
