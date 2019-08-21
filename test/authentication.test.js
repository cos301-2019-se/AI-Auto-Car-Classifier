var request = require("supertest");
var assert = require('assert');
const app = require("../server.js");
const auth =  require('../api/authentication');



let data = {
  imageID: 'Image1.jpg'
 }


describe('Testing log sign in.', function() {
  it('It should  return status = 200 ', function(done) {
    request(app)
      .post('/login')
      .send({name: 'Keo', email: 'null@haha.com'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      done()
  });
});