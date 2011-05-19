var assert = require("assert");
var db = require("mongoq");
//var testdb = db("testdb", {host: "localhost", port: "27017"});
var testdb = db("mongodb:\/\/localhost/testdb");
var col = testdb.collection("col");
var BSON = db.mongodb.BSONNative;
//equal ok notEqual deepEqual
//['insert', 'remove', 'rename', 'insertAll', 'save', 'update', 'distinct', 'count', 'drop', 'findAndModify', 'find', 'findOne', 'createIndex', 'ensureIndex', 'indexInformation', 'dropIndex', 'dropIndexes', 'mapReduce', 'group']
col.insert({"init": true}, function(err, doc) {
	assert.strictEqual(err, null);
	assert.strictEqual(doc[0]["init"], true);
	col.drop(function(err) {
		assert.strictEqual(err, null);
		//testdb.close();
		var data = [{'_id': new BSON.ObjectID('4dd3a7d8a48efdcf19000001'), 'name':'William Shakespeare', 'email':'william@shakespeare.com', 'age':587},{'_id': new BSON.ObjectID(), 'name':'Jorge Luis Borges', 'email':'jorge@borges.com', 'age': 587}];
		col.insert(data, function(err, doc) {
			col.findItems({}, function(err, doc){
				assert.equal(doc.length, 2);
				col.update({age: 587}, {"$set":{update:true}}, {upsert: true, multi: true, safe: true}, function(err, doc) {
					//don't need to return the document
					assert.strictEqual(err, null);
					col.update({age: 587}, {"$set":{reupdate:true}});
					col.findItems({reupdate: true}, function(err, doc) {
						assert.equal(doc.length, 1);
						testdb.close();
						console.log("Test ok");
					});
				});
			});
		});
	});
});
