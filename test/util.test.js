
var mongoq = require('../index.js')
, util = mongoq.util
, should = require('should');

describe( "util", function() {
	it( 'test util parseArgs', function(){
		(function() {
			var args = util.parseArgs(arguments);
			args.all.should.have.length(3);
			args.clean.should.have.length(3);
			args.clean[0].should.be.equal(1);
			should.not.exist(args.callback);

		})(1,2,3);

		(function() {
			var args = util.parseArgs(arguments);
			args.all.should.have.length(4);
			args.clean.should.have.length(3);
			args.clean[0].should.be.equal(1);
			should.exist(args.callback);
			args.callback.should.have.an.instanceof(Function);
		})(1,2,3, function() {
		});
	});

});
