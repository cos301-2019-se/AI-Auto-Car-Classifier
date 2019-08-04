const notification = require('../api/notification');

var request = require("supertest");
var assert = require('assert');
const app = require("../server.js");
const classification =  require('../api/classification.js');



describe('Testing email notification .', function() {
  it('It should return with status = 200', function(done) {
    request(app)
      .post('/email/sendEmail')
      .send({imageID: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      done()
  });
});