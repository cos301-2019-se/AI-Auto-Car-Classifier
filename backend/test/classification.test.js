var request = require("supertest");
var should = require("should");
const app = require("../server.js");

/**health tests for server */
describe('Test whether the server is up and running', function () {
  it('respond with json containing saying that the \'server is running\'', function (done) {
      request(app)
          .get('/classify/')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200, done);
  });

  it('It shoud return a 404 due to wrong protocol name', function (done) {
    request(app)
        .post('/classify/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404, done);
  });

  it('It shoud return a 200 even with missing slash after port', function (done) {
    request(app)
        .get('classify/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
  });

  it('It shoud return a 200 even with missing slash after classify', function (done) {
    request(app)
        .get('/classify')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
  });
});


/**health tests for server */
describe('Test whether the server is up and running', function () {
  it('respond with json containing saying that the \'server is running\'', function (done) {
      request(app)
          .get('/classify/')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200, done);
  });
});



