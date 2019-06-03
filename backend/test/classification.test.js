const uploadImage = require('../api/classification');
//var fs = require('fs');
var assert = require('assert');

//var file = fs. require('./car');
  describe('uploadImage("",0)', function() {
    it('should return "No Image Data received"', function() {
      assert.equal(uploadImage("",0), "No Image Data received");
    });
  });
