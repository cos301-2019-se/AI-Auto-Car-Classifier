const not = require('../api/notification');

var assert = require('assert');


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