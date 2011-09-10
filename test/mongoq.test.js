
/**
* Module dependencies.
*/
var mongoq = require('mongoq')
, should = require('should');

module.exports = {
	'test .version': function(){
		mongoq.version.should.match(/^\d+\.\d+\.\d+$/);
	}
	, 'test db arguments': function(){
		var db = mongoq("mongodb:\/\/fred:foobar@localhost:27017/testdb?auto_reconnect=true&poolSize=2");
		var options = db.options;
		options.should.be.a('object');
		options.auto_reconnect.should.be.true;
		options.poolSize.should.equal(2);
		options.host.should.equal("localhost");
		options.port.should.eql("27017");
		options.username.should.eql("fred");
		options.password.should.eql("foobar");
		db.dbname.should.eql("testdb");

		db = mongoq("mongodb:\/\/127.0.0.1:27018/testdb?auto_reconnect");
		options = db.options;
		options.should.be.a('object');
		options.auto_reconnect.should.be.true;
		options.host.should.equal("127.0.0.1");
		options.port.should.eql("27018");
		should.strictEqual(options.username, undefined);

		db = mongoq("mongodb:\/\/127.0.0.1:27018/testdb?auto_reconnect=false");
		options = db.options;
		options.should.be.a('object');
		options.auto_reconnect.should.be.false;

		db = mongoq("testdb", {auto_reconnect: true});
		options = db.options;
		options.should.be.a('object');
		options.host.should.equal("127.0.0.1");
		options.port.should.eql("27017");
		should.strictEqual(options.username, undefined);
		options.auto_reconnect.should.be.true;
		should.strictEqual(options.poolSize, undefined);
		db.dbname.should.eql("testdb");
	}
};
