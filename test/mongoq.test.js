
/**
 * Module dependencies.
 */

var mongoq = require('mongoq')
  , should = require('should');

module.exports = {
  'test .version': function(){
    mongoq.version.should.match(/^\d+\.\d+\.\d+$/);
  }
};