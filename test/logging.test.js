const log = require('../api/logging');

var request = require("supertest");
var assert = require('assert');
const app = require("../server.js");
const classification =  require('../api/classification.js');



let data = {
  imageID: 'Image1.jpg'
 }


describe('Testing log sign in.', function() {
  it('It should  return status = 200 ', function(done) {
    request(app)
      .post('/sign-in/logSignIn')
      .send({imageID: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      done()
  });
});


describe('Testing classification log', function() {
  it('It should return status = 200', function(done) {
    request(app)
      .post('/classification/logClassification')
      .send({imageID: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)

      done()
  });
});

describe('Testing classification failure log.', function() {
  it('It should return with status = 200', function(done) {
    request(app)
      .post('/classification-failure/logClassificationFailure')
      .send({imageID: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      done()
  });
});