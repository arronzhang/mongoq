var mongodb = require("mongodb"),
mongoserver = new mongodb.Server("127.0.0.1", 27017, {auto_reconnect: false}),
db_connector = new mongodb.Db("testdb", mongoserver, {});

db_connector.open(function(err, db) {
	console.log("open");
	db_connector.on("close", 	function() {
		console.log("close");
	//	console.log(arguments);
	});

		//db_connector.close();
});

db_connector.on("error", 	function() {
	console.log("error");
	//	console.log(arguments);
});

