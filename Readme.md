
mongoq
============================

Use mongoDB like this: mongoq("testdb").collection("users").find().toArray(function(err, users){});

Base on [node-mongodb-native][mongodb-native]


Features
-----------------------------

*	Standard connection string format
*	Full [node-mongodb-native][mongodb-native] methods and events supports
*	Chainable api


Installation
-----------------------------

>     npm install mongoq

Work like node-mongodb-native
-----------------------------------------

Mongoq bridge all the methods and events from [mongodb native database][mongodb-native-database] and [mongodb native collections][mongodb-native-collections], and make it chainable.

###Database

Provide a simple [connection string](http://www.mongodb.org/display/DOCS/Connections)

>     var mongoq = require("mongoq");
>
>     //use default server localhost:27017, auto_reconnect false, poolSize 1
>     var db = mongoq("testdb"); 
>
>     //use options
>     db = mongoq("testdb", {auto_reconnect: true, host: "127.0.0.1", port: "27017"}); 
>
>     //connection string
>     db = mongoq("mongodb://localhost/testdb"); 
>
>     // Connect and login to the "testdb" database as user "admin" with passowrd "foobar"
>     db = mongoq("mongodb://admin:foobar@localhost:27017/testdb?auto_reconnect=true;poolSize=2");
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

events

*	close
*	error
*	timeout

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

## License 

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
