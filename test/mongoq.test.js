
var mongoq = require('../index.js')
, should = require('should');

module.exports = {
	'test .version': function(){
		mongoq.version.should.match(/^\d+\.\d+\.\d+$/);
	}
};
