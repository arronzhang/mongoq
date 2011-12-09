
var mongoq = require('../index.js')
	, should = require('should');

describe("mongoq", function() {

	it( 'test .version', function(){
		mongoq.version.should.match(/^\d+\.\d+\.\d+$/);
	});

});
