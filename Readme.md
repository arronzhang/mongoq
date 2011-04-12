
mongoq
============================

Use mongoDB like this: db("testdb").collection("users").find(function(err, cursor){});

Base on [node-mongodb-native](https://github.com/christkv/node-mongodb-native)


Installation
-----------------------------

>     npm install mongoq

mongoq
-----------------------------------------

Bridge all the methods from Collection

###additional methods

>     findItems(..., callback(err, itemsArray))


###Support connection string

[Mongodb doc for connection string](http://www.mongodb.org/display/DOCS/Connections)

Connect to "testdb" database

>     var testdb = db("testdb");
>     var testdb = db("mongodb://localhost/testdb");
>     var testdb = db("mongodb://localhost:27017/testdb");

Connect and login to the "testdb" database as user "fred" with passowrd "foobar"

>     var testdb = db("mongodb://fred:foobar@localhost/testdb");

Example
-----------------------------------------

	var db = require("mongoq");
	var testdb = db("mongodb://localhost/testdb");
	var col = testdb.collection("col");
	col.insert({"init": true}, function(err, doc) {
		col.drop(function(err) {
			//testdb.close();
			var data = [{'name':'William Shakespeare', 'email':'william@shakespeare.com', 'age':587},{'name':'Jorge Luis Borges', 'email':'jorge@borges.com', 'age': 587}];
			col.insert(data, function(err, doc) {
				col.findItems({}, function(err, doc){
					col.update({age: 587}, {"$set":{update:true}}, {upsert: true, multi: true, safe: true}, function(err, doc) {
						//don't need to return the document
						testdb.close();
						console.log("Test ok");
					});
				});
			});
		});
	});


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
