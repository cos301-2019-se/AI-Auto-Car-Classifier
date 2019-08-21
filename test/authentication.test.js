var request = require("supertest");
var assert = require('assert');
const app = require("../server.js");
const auth =  require('../api/authentication');


describe('Testing authentification.', function() {
    this.timeout(2000);
    setTimeout(500);
  it('Return 401 error code', function(done) {
    request(app)
      .post('/login')
      .send({name: 'Keo', email: 'null@haha.com'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      done()
  });


  it('Successfully authenticate', function(done) {
    request(app)
      .post('/login')
      .send({name: 'Keo', email: 'null@haha.com'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect()
      done()
  });
});